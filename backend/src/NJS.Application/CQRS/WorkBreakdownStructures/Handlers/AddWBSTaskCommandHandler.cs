using MediatR;
using Microsoft.EntityFrameworkCore;
using NJS.Application.CQRS.WorkBreakdownStructures.Commands;
using NJS.Application.Dtos;
using NJS.Domain.Database;
using NJS.Domain.Entities;
using NJS.Domain.Enums; // Add import for WBSTaskLevel
using NJS.Domain.UnitWork;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging; // Add this for ILogger
using NJS.Repositories.Interfaces; // Add this for IWBSOptionRepository

namespace NJS.Application.CQRS.WorkBreakdownStructures.Handlers
{
    public class AddWBSTaskCommandHandler : IRequestHandler<AddWBSTaskCommand, WBSMasterDto>
    {
        private readonly ProjectManagementContext _context;
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILogger<AddWBSTaskCommandHandler> _logger;
        private readonly IWBSOptionRepository _wbsOptionRepository; // Inject IWBSOptionRepository

        // TODO: Inject ICurrentUserService or similar
        private readonly string _currentUser = "System"; // Placeholder

        public AddWBSTaskCommandHandler(ProjectManagementContext context, IUnitOfWork unitOfWork, ILogger<AddWBSTaskCommandHandler> logger, IWBSOptionRepository wbsOptionRepository)
        {
            _context = context;
            _unitOfWork = unitOfWork;
            _logger = logger;
            _wbsOptionRepository = wbsOptionRepository; // Assign repository
        }

        public async Task<WBSMasterDto> Handle(AddWBSTaskCommand request, CancellationToken cancellationToken)
        {
            _logger.LogInformation("Handling AddWBSTaskCommand for ProjectId {ProjectId}, Payload {@Payload}",
                request.ProjectId, request.WBSMaster);

            // --- 1. Find or create WBSHeader ---
            WBSHeader wbsHeader;
            if (request.WBSMaster.WbsHeaderId > 0)
            {
                wbsHeader = await _context.WBSHeaders
                    .Include(h => h.WorkBreakdownStructures)
                        .ThenInclude(wbs => wbs.Tasks)
                    .FirstOrDefaultAsync(h => h.Id == request.WBSMaster.WbsHeaderId && h.ProjectId == request.ProjectId, cancellationToken);

                if (wbsHeader == null)
                {
                    throw new ArgumentException($"WBSHeader with ID {request.WBSMaster.WbsHeaderId} not found for project {request.ProjectId}.");
                }
            }
            else
            {
                // Create new WBSHeader
                wbsHeader = new WBSHeader
                {
                    ProjectId = request.ProjectId,
                    Version = "1.0",
                    VersionDate = DateTime.UtcNow,
                    CreatedBy = _currentUser,
                    IsActive = true,
                    ApprovalStatus = PMWorkflowStatusEnum.Initial,
                    WorkBreakdownStructures = new List<WorkBreakdownStructure>()
                };
                _context.WBSHeaders.Add(wbsHeader);
                await _unitOfWork.SaveChangesAsync();
            }

            // --- 2. Process each WorkBreakdownStructure from WBSMasterDto ---
            foreach (var wbsGroupDto in request.WBSMaster.WorkBreakdownStructures)
            {
                WorkBreakdownStructure wbsGroupEntity;

                if (wbsGroupDto.WorkBreakdownStructureId > 0)
                {
                    // Find existing WBS group
                    wbsGroupEntity = wbsHeader.WorkBreakdownStructures
                        .FirstOrDefault(w => w.Id == wbsGroupDto.WorkBreakdownStructureId);

                    if (wbsGroupEntity == null)
                    {
                        throw new ArgumentException($"WorkBreakdownStructure with ID {wbsGroupDto.WorkBreakdownStructureId} not found.");
                    }

                    wbsGroupEntity.Name = wbsGroupDto.Name;
                    wbsGroupEntity.Description = wbsGroupDto.Description;
                    wbsGroupEntity.DisplayOrder = wbsGroupDto.DisplayOrder;
                    _context.WorkBreakdownStructures.Update(wbsGroupEntity);
                }
                else
                {
                    // Create new WBS group
                    wbsGroupEntity = new WorkBreakdownStructure
                    {
                        WBSHeader = wbsHeader,
                        Name = wbsGroupDto.Name,
                        Description = wbsGroupDto.Description,
                        DisplayOrder = wbsGroupDto.DisplayOrder,
                        CreatedAt = DateTime.UtcNow,
                        CreatedBy = _currentUser,
                        Tasks = new List<WBSTask>()
                    };
                    _context.WorkBreakdownStructures.Add(wbsGroupEntity);
                    wbsHeader.WorkBreakdownStructures.Add(wbsGroupEntity);
                }

                await _unitOfWork.SaveChangesAsync();

                // --- 3. Process tasks for this WBS group ---
                var tempIdToEntityMap = new Dictionary<string, WBSTask>();
                var pendingParentUpdates = new Dictionary<WBSTask, string>();
                var allNewTasks = new List<WBSTask>();

                // Pre-fetch all WBS options and users needed for the batch
                var wbsOptionIds = wbsGroupDto.Tasks.Where(t => t.WBSOptionId.HasValue).Select(t => t.WBSOptionId.Value).Distinct().ToList();
                var wbsOptionsMap = (await _wbsOptionRepository.GetByIdsAsync(wbsOptionIds))
                                    .ToDictionary(o => o.Id, o => o.Label);

                var assignedUserIds = wbsGroupDto.Tasks
                    .Where(t => t.TaskType == TaskType.Manpower && !string.IsNullOrEmpty(t.AssignedUserId) && t.AssignedUserId != "string")
                    .Select(t => t.AssignedUserId!)
                    .Distinct()
                    .ToList();
                var existingUserIds = new HashSet<string>(await _context.Users
                    .Where(u => assignedUserIds.Contains(u.Id))
                    .Select(u => u.Id)
                    .ToListAsync(cancellationToken));

                foreach (var taskDto in wbsGroupDto.Tasks)
                {
                    // Handle ParentId based on task level
                    if (taskDto.Level == WBSTaskLevel.Level1)
                    {
                        taskDto.ParentId = null; // Level 1 tasks do not have a parent
                    }

                    // Optional: Validate ParentId if provided (only for existing parents)
                    if (taskDto.ParentId.HasValue && !wbsGroupEntity.Tasks.Any(t => t.Id == taskDto.ParentId.Value && !t.IsDeleted))
                    {
                        _logger.LogError("Parent Task with ID {ParentId} not found in WBS {WBSId}.", taskDto.ParentId.Value, wbsGroupEntity.Id);
                        throw new Exception($"Parent Task with ID {taskDto.ParentId.Value} not found in the WBS.");
                    }

                    // --- Create the new WBSTask entity ---
                    var taskEntity = new WBSTask
                    {
                        WorkBreakdownStructureId = wbsGroupEntity.Id,
                        Description = taskDto.Description,
                        Level = taskDto.Level,
                        DisplayOrder = taskDto.DisplayOrder,
                        EstimatedBudget = taskDto.EstimatedBudget,
                        StartDate = taskDto.StartDate,
                        EndDate = taskDto.EndDate,
                        TaskType = taskDto.TaskType,
                        CreatedAt = DateTime.UtcNow,
                        CreatedBy = _currentUser,
                        IsDeleted = false,
                        UserWBSTasks = new List<UserWBSTask>(),
                        PlannedHours = new List<WBSTaskPlannedHour>(),
                        WBSOptionId = taskDto.WBSOptionId,
                        Title = taskDto.Title
                    };

                    // If WBSOptionId is provided, override Title with the WBSOption's label
                    if (taskDto.WBSOptionId.HasValue && wbsOptionsMap.TryGetValue(taskDto.WBSOptionId.Value, out var wbsOptionLabel))
                    {
                        taskEntity.Title = wbsOptionLabel;
                    }

                    // Add User Assignment and Planned Hours
                    UpdateUserAssignment(taskEntity, taskDto, existingUserIds);
                    UpdatePlannedHours(taskEntity, taskDto, wbsHeader.ProjectId);

                    _context.WBSTasks.Add(taskEntity);
                    allNewTasks.Add(taskEntity);

                    if (!string.IsNullOrEmpty(taskDto.FrontendTempId))
                        tempIdToEntityMap[taskDto.FrontendTempId] = taskEntity;

                    if (!string.IsNullOrEmpty(taskDto.ParentFrontendTempId))
                    {
                        taskEntity.ParentId = null;
                        pendingParentUpdates[taskEntity] = taskDto.ParentFrontendTempId;
                    }
                    else if (taskDto.ParentId.HasValue)
                    {
                        taskEntity.ParentId = taskDto.ParentId;
                    }
                }

                _logger.LogInformation("Adding all WBSTasks to context. Attempting first save changes.");
                await _unitOfWork.SaveChangesAsync(); // First save to get IDs for all new tasks
                _logger.LogInformation("All new WBSTasks saved successfully. Resolving parent IDs.");

                bool requiresSecondSave = false;
                foreach (var kv in pendingParentUpdates)
                {
                    if (tempIdToEntityMap.TryGetValue(kv.Value, out var parentEntity) && parentEntity.Id > 0)
                    {
                        kv.Key.ParentId = parentEntity.Id;
                        requiresSecondSave = true;
                    }
                    else
                    {
                        _logger.LogWarning("Unable to resolve parent task for temp ID {TempId}", kv.Value);
                    }
                }

                if (requiresSecondSave)
                {
                    _logger.LogInformation("Updating parent IDs. Attempting second save changes.");
                    await _unitOfWork.SaveChangesAsync(); // Second save for parent ID updates
                    _logger.LogInformation("Parent IDs updated successfully.");
                }

                // Update DTOs with saved entity data
                foreach (var taskDto in wbsGroupDto.Tasks)
                {
                    var correspondingEntity = allNewTasks.FirstOrDefault(t =>
                        t.Id == taskDto.Id ||
                        (!string.IsNullOrEmpty(taskDto.FrontendTempId) &&
                         tempIdToEntityMap.ContainsKey(taskDto.FrontendTempId) &&
                         tempIdToEntityMap[taskDto.FrontendTempId].Id == t.Id));

                    if (correspondingEntity != null)
                    {
                        taskDto.Id = correspondingEntity.Id;
                        taskDto.Title = correspondingEntity.Title;
                        taskDto.ParentId = correspondingEntity.ParentId;

                        // Update WBSOptionLabel
                        if (correspondingEntity.WBSOptionId.HasValue && wbsOptionsMap.TryGetValue(correspondingEntity.WBSOptionId.Value, out var wbsOptionLabel))
                        {
                            taskDto.WBSOptionLabel = wbsOptionLabel;
                        }

                        // Populate User Assignment details
                        var userTask = correspondingEntity.UserWBSTasks.FirstOrDefault();
                        if (userTask != null)
                        {
                            taskDto.AssignedUserId = userTask.UserId;
                            taskDto.AssignedUserName = userTask.Name;
                            taskDto.CostRate = userTask.CostRate;
                            taskDto.ResourceName = userTask.Name;
                            taskDto.ResourceUnit = userTask.Unit;
                            taskDto.ResourceRoleId = userTask.ResourceRoleId;
                            taskDto.TotalHours = userTask.TotalHours;
                            taskDto.TotalCost = userTask.TotalCost;
                        }

                        // Populate Planned Hours
                        taskDto.PlannedHours = correspondingEntity.PlannedHours.Select(ph => new PlannedHourDto
                        {
                            Year = int.TryParse(ph.Year, out int year) ? year : 0,
                            Month = ph.Month,
                            PlannedHours = ph.PlannedHours
                        }).ToList();
                    }
                }
            }

            return request.WBSMaster;
        }

        // --- Helper methods copied from SetWBSCommandHandler ---
        // (Consider refactoring into a shared service/utility class later)

        private void UpdateUserAssignment(WBSTask taskEntity, WBSTaskDto taskDto, HashSet<string> existingUserIds)
        {
            // Handle Manpower tasks
            if (taskEntity.TaskType == TaskType.Manpower)
            {
                // For Level 3 tasks, always create a UserWBSTask entry.
                // For other levels, only create if AssignedUserId is provided.
                bool shouldCreateUserWBSTask = taskEntity.Level == WBSTaskLevel.Level3 ||
                                               (!string.IsNullOrEmpty(taskDto.AssignedUserId) && taskDto.AssignedUserId != "string");

                if (shouldCreateUserWBSTask)
                {
                    // Determine the actual UserId and ResourceRoleId to save (null if "string" or empty)
                    string? actualUserId = (string.IsNullOrEmpty(taskDto.AssignedUserId) || taskDto.AssignedUserId == "string") ? null : taskDto.AssignedUserId;
                    string? actualResourceRoleId = (string.IsNullOrEmpty(taskDto.ResourceRoleId) || taskDto.ResourceRoleId == "string") ? null : taskDto.ResourceRoleId;

                    // Validate if the assigned user exists using pre-fetched data, but only if an ID is actually provided
                    if (!string.IsNullOrEmpty(actualUserId) && !existingUserIds.Contains(actualUserId))
                    {
                        throw new Exception($"Assigned User with ID '{actualUserId}' not found. Cannot assign task.");
                    }

                    // Create new assignment for Manpower task
                    var newUserTask = new UserWBSTask
                    {
                        WBSTask = taskEntity,
                        UserId = actualUserId,
                        Name = null, // No Name for Manpower tasks
                        CostRate = taskDto.CostRate,
                        Unit = taskDto.ResourceUnit,
                        TotalHours = taskEntity.PlannedHours.Sum(ph => ph.PlannedHours),
                        TotalCost = (decimal)taskEntity.PlannedHours.Sum(ph => ph.PlannedHours) * taskDto.CostRate,
                        CreatedAt = DateTime.UtcNow,
                        CreatedBy = _currentUser,
                        ResourceRoleId = actualResourceRoleId
                    };
                    taskEntity.UserWBSTasks.Add(newUserTask);
                }
            }
            // Handle ODC tasks
            else if (taskEntity.TaskType == TaskType.ODC)
            {
                // Only proceed if Name is not null/empty
                if (!string.IsNullOrEmpty(taskDto.ResourceName))
                {
                    // Create new assignment for ODC task
                    var newUserTask = new UserWBSTask
                    {
                        WBSTask = taskEntity,
                        UserId = null, // No UserId for ODC tasks
                        Name = taskDto.ResourceName,
                        CostRate = taskDto.CostRate,
                        Unit = taskDto.ResourceUnit,
                        TotalHours = taskEntity.PlannedHours.Sum(ph => ph.PlannedHours),
                        TotalCost = (decimal)taskEntity.PlannedHours.Sum(ph => ph.PlannedHours) * taskDto.CostRate,
                        CreatedAt = DateTime.UtcNow,
                        CreatedBy = _currentUser,
                        ResourceRoleId = taskDto.ResourceRoleId // Add ResourceRoleId
                    };
                    taskEntity.UserWBSTasks.Add(newUserTask);
                }
            }
        }

        private void UpdatePlannedHours(WBSTask taskEntity, WBSTaskDto taskDto, int projectId)
        {
            // Ensure a WBSTaskPlannedHourHeader exists for this project and task type
            // Or create a new one if it doesn't exist
            var plannedHourHeader = _context.WBSTaskPlannedHourHeaders
                .FirstOrDefault(h => h.ProjectId == projectId && h.TaskType == taskEntity.TaskType);

            if (plannedHourHeader == null)
            {
                plannedHourHeader = new WBSTaskPlannedHourHeader
                {
                    ProjectId = projectId,
                    CreatedAt = DateTime.UtcNow,
                    CreatedBy = _currentUser,
                    TaskType = taskEntity.TaskType,
                    StatusId = (int)PMWorkflowStatusEnum.Initial // Default status
                };
                _context.WBSTaskPlannedHourHeaders.Add(plannedHourHeader);
            }

            // Add new ones from DTO
            foreach (var phDto in taskDto.PlannedHours)
            {
                var newPh = new WBSTaskPlannedHour
                {
                    WBSTask = taskEntity, // EF Core should link this
                    WBSTaskPlannedHourHeader = plannedHourHeader, // Link to the header
                    Year = phDto.Year.ToString(),
                    Month = phDto.Month,
                    PlannedHours = phDto.PlannedHours,
                    CreatedAt = DateTime.UtcNow,
                    CreatedBy = _currentUser
                };
                taskEntity.PlannedHours.Add(newPh);
            }

            // Recalculate TotalHours/Cost on the UserWBSTask if it exists (it should have been added just before)
            var userTask = taskEntity.UserWBSTasks.FirstOrDefault();
            if (userTask != null)
            {
                userTask.TotalHours = taskEntity.PlannedHours.Sum(ph => ph.PlannedHours);
                userTask.TotalCost = (decimal)userTask.TotalHours * userTask.CostRate;
            }
        }
    }
}

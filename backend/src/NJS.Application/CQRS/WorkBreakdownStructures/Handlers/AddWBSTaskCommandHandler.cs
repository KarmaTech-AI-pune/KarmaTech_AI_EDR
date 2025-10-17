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
    public class AddWBSTaskCommandHandler : IRequestHandler<AddWBSTaskCommand, List<WBSTaskDto>>
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

        public async Task<List<WBSTaskDto>> Handle(AddWBSTaskCommand request, CancellationToken cancellationToken)
        {
            _logger.LogInformation("Handling AddWBSTaskCommand for ProjectId {ProjectId}, Payload {@Payload}",
                request.ProjectId, request.TasksDto);

            var createdTasks = new List<WBSTaskDto>();
            var tempIdToEntityMap = new Dictionary<string, WBSTask>();
            var pendingParentUpdates = new Dictionary<WBSTask, string>();
            var allNewTasks = new List<WBSTask>();

            // --- 1. Find the active WBS for the project ---
            var wbs = await _context.WorkBreakdownStructures
                .Include(w => w.Tasks) // Include tasks to potentially validate ParentId if needed
                .FirstOrDefaultAsync(w => w.ProjectId == request.ProjectId && w.IsActive, cancellationToken);

            if (wbs == null)
            {
                _logger.LogWarning("No active Work Breakdown Structure found for Project ID {ProjectId}. Creating a new one.", request.ProjectId);
                // Create a new WBS if none exists
                wbs = new WorkBreakdownStructure
                {
                    ProjectId = request.ProjectId,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    CreatedBy = _currentUser,
                    Tasks = new List<WBSTask>() // Initialize tasks collection
                };
                _context.WorkBreakdownStructures.Add(wbs);
                await _unitOfWork.SaveChangesAsync(); // Save the new WBS to get its ID
                _logger.LogInformation("New Work Breakdown Structure created with ID {WBSId} for Project ID {ProjectId}.", wbs.Id, request.ProjectId);
            }

            // Pre-fetch all WBS options and users needed for the batch
            var wbsOptionIds = request.TasksDto.Where(t => t.WBSOptionId.HasValue).Select(t => t.WBSOptionId.Value).Distinct().ToList();
            var wbsOptionsMap = (await _wbsOptionRepository.GetByIdsAsync(wbsOptionIds))
                                .ToDictionary(o => o.Id, o => o.Label);

            var assignedUserIds = request.TasksDto
                .Where(t => t.TaskType == TaskType.Manpower && !string.IsNullOrEmpty(t.AssignedUserId) && t.AssignedUserId != "string")
                .Select(t => t.AssignedUserId!)
                .Distinct()
                .ToList();
            var existingUserIds = new HashSet<string>(await _context.Users
                .Where(u => assignedUserIds.Contains(u.Id))
                .Select(u => u.Id)
                .ToListAsync(cancellationToken));

            foreach (var taskDto in request.TasksDto)
            {
                // Handle ParentId based on task level
                if (taskDto.Level == WBSTaskLevel.Level1)
                {
                    taskDto.ParentId = null; // Level 1 tasks do not have a parent
                }

                // Optional: Validate ParentId if provided (only for existing parents)
                if (taskDto.ParentId.HasValue && !wbs.Tasks.Any(t => t.Id == taskDto.ParentId.Value && !t.IsDeleted))
                {
                    _logger.LogError("Parent Task with ID {ParentId} not found in WBS {WBSId}.", taskDto.ParentId.Value, wbs.Id);
                    throw new Exception($"Parent Task with ID {taskDto.ParentId.Value} not found in the WBS.");
                }

                // --- 2. Create the new WBSTask entity ---
                var taskEntity = new WBSTask
                {
                    WorkBreakdownStructureId = wbs.Id, // Associate with the found or newly created WBS
                    Description = taskDto.Description,
                    Level = taskDto.Level,
                    // ParentId will be resolved in a second pass if ParentFrontendTempId is present
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
                    WBSOptionId = taskDto.WBSOptionId, // Set the WBSOptionId
                    Title = taskDto.Title // Assign Title from DTO initially
                };

                // If WBSOptionId is provided, override Title with the WBSOption's label using pre-fetched map
                if (taskDto.WBSOptionId.HasValue && wbsOptionsMap.TryGetValue(taskDto.WBSOptionId.Value, out var wbsOptionLabel))
                {
                    taskEntity.Title = wbsOptionLabel; // Set entity Title to label for saving
                }

                _logger.LogInformation("Mapped WBSTask entity: {@TaskEntity}", taskEntity);

                // --- 3. Add User Assignment and Planned Hours ---
                UpdateUserAssignment(taskEntity, taskDto, existingUserIds); // Pass pre-fetched user IDs
                UpdatePlannedHours(taskEntity, taskDto, wbs.ProjectId);

                _context.WBSTasks.Add(taskEntity);
                allNewTasks.Add(taskEntity);

                if (!string.IsNullOrEmpty(taskDto.FrontendTempId))
                    tempIdToEntityMap[taskDto.FrontendTempId] = taskEntity;

                if (!string.IsNullOrEmpty(taskDto.ParentFrontendTempId))
                {
                    taskEntity.ParentId = null; // Temporarily set to null, will be resolved later
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

            // Now that all entities are saved and parent IDs are resolved, populate the DTOs for the response.
            foreach (var entity in allNewTasks)
            {
                var dto = new WBSTaskDto
                {
                    Id = entity.Id,
                    WorkBreakdownStructureId = entity.WorkBreakdownStructureId,
                    ParentId = entity.ParentId,
                    Level = entity.Level,
                    Title = entity.Title,
                    Description = entity.Description,
                    DisplayOrder = entity.DisplayOrder,
                    EstimatedBudget = entity.EstimatedBudget,
                    StartDate = entity.StartDate,
                    EndDate = entity.EndDate,
                    TaskType = entity.TaskType,
                    WBSOptionId = entity.WBSOptionId,
                    // Populate other fields as needed from the entity
                };

                // Populate WBSOptionLabel using pre-fetched map
                if (entity.WBSOptionId.HasValue && wbsOptionsMap.TryGetValue(entity.WBSOptionId.Value, out var wbsOptionLabel))
                {
                    dto.WBSOptionLabel = wbsOptionLabel;
                }

                // Populate User Assignment details if available
                var userTask = entity.UserWBSTasks.FirstOrDefault();
                if (userTask != null)
                {
                    dto.AssignedUserId = userTask.UserId;
                    dto.AssignedUserName = userTask.Name; // Assuming Name is populated for ODC or can be looked up for Manpower
                    dto.CostRate = userTask.CostRate;
                    dto.ResourceName = userTask.Name; // For ODC
                    dto.ResourceUnit = userTask.Unit;
                    dto.ResourceRoleId = userTask.ResourceRoleId;
                    // ResourceRoleName would need another lookup if not directly stored
                    dto.TotalHours = userTask.TotalHours;
                    dto.TotalCost = userTask.TotalCost;
                }

                // Populate Planned Hours
                dto.PlannedHours = entity.PlannedHours.Select(ph => new PlannedHourDto
                {
                    Year = int.TryParse(ph.Year, out int year) ? year : 0,
                    Month = ph.Month,
                    PlannedHours = ph.PlannedHours
                }).ToList();

                createdTasks.Add(dto);
            }
            return createdTasks;
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

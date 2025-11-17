using MediatR;
using Microsoft.EntityFrameworkCore;
using NJS.Application.CQRS.WorkBreakdownStructures.Commands;
using NJS.Application.Dtos;
using NJS.Domain.Database;
using NJS.Domain.Entities;
using NJS.Domain.Enums;
using NJS.Domain.UnitWork;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using NJS.Repositories.Interfaces;

namespace NJS.Application.CQRS.WorkBreakdownStructures.Handlers
{
    public class AddWBSTaskCommandHandler : IRequestHandler<AddWBSTaskCommand, WBSMasterDto>
    {
        private readonly ProjectManagementContext _context;
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILogger<AddWBSTaskCommandHandler> _logger;
        private readonly IWBSOptionRepository _wbsOptionRepository;

        private readonly string _currentUser = "System";
        private readonly Dictionary<int, WBSTask> _inMemoryTasks = new Dictionary<int, WBSTask>();

        public AddWBSTaskCommandHandler(
            ProjectManagementContext context,
            IUnitOfWork unitOfWork,
            ILogger<AddWBSTaskCommandHandler> logger,
            IWBSOptionRepository wbsOptionRepository)
        {
            _context = context;
            _unitOfWork = unitOfWork;
            _logger = logger;
            _wbsOptionRepository = wbsOptionRepository;
        }

        public async Task<WBSMasterDto> Handle(AddWBSTaskCommand request, CancellationToken cancellationToken)
        {
            _logger.LogInformation("Handling AddWBSTaskCommand for ProjectId {ProjectId}, Payload {@Payload}",
                request.ProjectId, request.WBSMaster);

            // Find or create WBSHeader
            var wbsHeader = await FindOrCreateWBSHeader(request, cancellationToken);

            // Process each WorkBreakdownStructure
            foreach (var wbsGroupDto in request.WBSMaster.WorkBreakdownStructures)
            {
                var wbsGroupEntity = await ProcessWorkBreakdownStructure(wbsHeader, wbsGroupDto, cancellationToken);

                // Pre-fetch WBS options and users
                var (wbsOptionsMap, existingUserIds) = await PreFetchOptionsAndUsers(wbsGroupDto, cancellationToken);

                var allNewTasks = new List<WBSTask>();

                // Process tasks for this WBS group
                foreach (var taskDto in wbsGroupDto.Tasks)
                {
                    var taskEntity = await CreateWBSTask(
                        taskDto,
                        wbsGroupEntity,
                        wbsOptionsMap,
                        existingUserIds,
                        request.ProjectId,
                        cancellationToken,
                        _inMemoryTasks); // Pass the in-memory tasks dictionary

                    _context.WBSTasks.Add(taskEntity);
                    allNewTasks.Add(taskEntity);
                    // Add the newly created task to the in-memory dictionary for parent tracking
                    if (taskDto.Id > 0) // Ensure taskDto.Id is valid
                    {
                        _inMemoryTasks.Add(taskDto.Id, taskEntity);
                    }
                }

                // Update DTOs with saved entity data
                await UpdateTaskDtos(wbsGroupDto.Tasks, allNewTasks, wbsOptionsMap);
            }

            // Save all changes
            await _unitOfWork.SaveChangesAsync();

            return request.WBSMaster;
        }

        private async Task<WBSHeader> FindOrCreateWBSHeader(AddWBSTaskCommand request, CancellationToken cancellationToken)
        {
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
            return wbsHeader;
        }

        private async Task<WorkBreakdownStructure> ProcessWorkBreakdownStructure(
            WBSHeader wbsHeader,
            WBSStructureMasterDto wbsGroupDto,
            CancellationToken cancellationToken)
        {
            WorkBreakdownStructure wbsGroupEntity;

            if (wbsGroupDto.WorkBreakdownStructureId > 0)
            {
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
            return wbsGroupEntity;
        }

        private async Task<(Dictionary<int, string> wbsOptionsMap, HashSet<string> existingUserIds)> PreFetchOptionsAndUsers(
            WBSStructureMasterDto wbsGroupDto,
            CancellationToken cancellationToken)
        {
            var wbsOptionIds = wbsGroupDto.Tasks
                .Where(t => t.WBSOptionId > 0)
                .Select(t => t.WBSOptionId)
                .Distinct()
                .ToList();

            var wbsOptionsMap = (await _wbsOptionRepository.GetByIdsAsync(wbsOptionIds))
                .ToDictionary(o => o.Id, o => o.Label);

            var assignedUserIds = wbsGroupDto.Tasks
                .Where(t => t.TaskType == TaskType.Manpower &&
                            !string.IsNullOrEmpty(t.AssignedUserId) &&
                            t.AssignedUserId != "string")
                .Select(t => t.AssignedUserId!)
                .Distinct()
                .ToList();

            var existingUserIds = new HashSet<string>(
                await _context.Users
                    .Where(u => assignedUserIds.Contains(u.Id))
                    .Select(u => u.Id)
                    .ToListAsync(cancellationToken));

            return (wbsOptionsMap, existingUserIds);
        }

        private async Task<WBSTask> CreateWBSTask(
            WBSTaskDto taskDto,
            WorkBreakdownStructure wbsGroupEntity,
            Dictionary<int, string> wbsOptionsMap,
            HashSet<string> existingUserIds,
            int projectId,
            CancellationToken cancellationToken,
            Dictionary<int, WBSTask> inMemoryTasks) // Added dictionary parameter
        {
            // Validate required fields
            if (taskDto.WBSOptionId <= 0)
            {
                _logger.LogError("WBSOptionId is required for task. ProjectId: {ProjectId}, WBSGroupId: {WBSGroupId}",
                    projectId, wbsGroupEntity.Id);
                throw new Exception("WBSOptionId is required for a task.");
            }

            if (string.IsNullOrEmpty(taskDto.Title))
            {
                _logger.LogError("Task Title is required. ProjectId: {ProjectId}, WBSGroupId: {WBSGroupId}",
                    projectId, wbsGroupEntity.Id);
                throw new Exception("Task Title is required.");
            }

            // Fetch the WBSOption to get its ParentId
            var wbsOption = await _wbsOptionRepository.GetByIdAsync(taskDto.WBSOptionId);
            int? parentWbsOptionId = wbsOption?.ParentId; // Get the ParentId from WBSOption

            // Get WBS Option Label but preserve the original title
            string? wbsOptionLabel = null;
            wbsOptionsMap.TryGetValue(taskDto.WBSOptionId, out wbsOptionLabel);
            string taskTitle = taskDto.Title; // Always use the original title

            // Create task entity
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
                Title = taskTitle,
                ParentId = parentWbsOptionId // Assign the ParentId from WBSOption
            };

            // Add user assignment and planned hours
            UpdateUserAssignment(taskEntity, taskDto, existingUserIds);
            UpdatePlannedHours(taskEntity, taskDto, projectId);

            return taskEntity;
        }

        private async Task UpdateTaskDtos(
            List<WBSTaskDto> taskDtos,
            List<WBSTask> allNewTasks,
            Dictionary<int, string> wbsOptionsMap)
        {
            foreach (var taskDto in taskDtos)
            {
                var correspondingEntity = allNewTasks.FirstOrDefault(t => t.Id == taskDto.Id);
                if (correspondingEntity != null)
                {
                    taskDto.Id = correspondingEntity.Id;
                    taskDto.Title = correspondingEntity.Title;

                    // Update WBSOptionLabel
                    if (correspondingEntity.WBSOptionId > 0 &&
                        wbsOptionsMap.TryGetValue(correspondingEntity.WBSOptionId, out var wbsOptionLabel))
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
                        taskDto.ResourceUnit = userTask.Unit; // This line caused a compilation error
                        taskDto.ResourceRoleId = userTask.ResourceRoleId;
                        taskDto.TotalHours = userTask.TotalHours;
                        taskDto.TotalCost = userTask.TotalCost;
                    }

                    // Populate Planned Hours
                    taskDto.PlannedHours = correspondingEntity.PlannedHours
                        .Select(ph => new PlannedHourDto
                        {
                            Year = int.TryParse(ph.Year, out int year) ? year : 0,
                            Month = ph.Month,
                            PlannedHours = ph.PlannedHours
                        }).ToList();
                }
            }
        }

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
                        Unit = taskDto.ResourceUnit, // Corrected from ResourceUnit to Unit based on UserWBSTask definition
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
                userTask.TotalCost = (decimal)taskEntity.PlannedHours.Sum(ph => ph.PlannedHours) * userTask.CostRate;
            }
        }
    }
}

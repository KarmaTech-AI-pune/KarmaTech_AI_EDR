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

            foreach (var taskDto in request.TasksDto.OrderBy(t => t.Level).ThenBy(t => t.DisplayOrder)) // Process in order of level and display order
            {
                // ParentId will be resolved in a second pass if ParentFrontendTempId is present
                // For Level 1 tasks, ParentId is always null
                if (taskDto.Level == WBSTaskLevel.Level1)
                {
                    taskDto.ParentId = null;
                }
                else if (taskDto.ParentFrontendTempId == null && taskDto.ParentId.HasValue)
                {
                    // If ParentFrontendTempId is not provided, but ParentId is, validate against existing WBS tasks
                    if (!wbs.Tasks.Any(t => t.Id == taskDto.ParentId.Value && !t.IsDeleted))
                    {
                        _logger.LogError("Parent Task with ID {ParentId} not found in existing WBS {WBSId}.", taskDto.ParentId.Value, wbs.Id);
                        throw new Exception($"Parent Task with ID {taskDto.ParentId.Value} not found in the existing WBS.");
                    }
                }
                else
                {
                    // For tasks with ParentFrontendTempId, ParentId will be resolved in the second pass
                    taskDto.ParentId = null; // Temporarily set to null
                }

                // --- 2. Create the new WBSTask entity ---
                var taskEntity = new WBSTask
                {
                    WorkBreakdownStructureId = wbs.Id, // Associate with the found or newly created WBS
                    Description = taskDto.Description,
                    Level = taskDto.Level,
                    ParentId = taskDto.ParentId, // Use the resolved/null ParentId from above
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

                // If WBSOptionId is provided, override Title with the WBSOption's label
                if (taskDto.WBSOptionId.HasValue)
                {
                    var wbsOption = await _wbsOptionRepository.GetByIdAsync(taskDto.WBSOptionId.Value);
                    if (wbsOption != null)
                    {
                        taskEntity.Title = wbsOption.Label; // Set entity Title to label for saving
                    }
                }

                _logger.LogInformation("Mapped WBSTask entity: {@TaskEntity}", taskEntity);

                // --- 3. Add User Assignment and Planned Hours ---
                await UpdateUserAssignment(taskEntity, taskDto, cancellationToken); // Corrected call
                UpdatePlannedHours(taskEntity, taskDto, wbs.ProjectId);

                _context.WBSTasks.Add(taskEntity);
                allNewTasks.Add(taskEntity);

                if (!string.IsNullOrEmpty(taskDto.FrontendTempId))
                    tempIdToEntityMap[taskDto.FrontendTempId] = taskEntity;

                if (!string.IsNullOrEmpty(taskDto.ParentFrontendTempId))
                {
                    // ParentId is already set to null or validated against existing.
                    // This is for the second pass resolution.
                    pendingParentUpdates[taskEntity] = taskDto.ParentFrontendTempId;
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

                // Populate WBSOptionLabel
                if (entity.WBSOptionId.HasValue)
                {
                    var wbsOption = await _wbsOptionRepository.GetByIdAsync(entity.WBSOptionId.Value);
                    if (wbsOption != null)
                    {
                        dto.WBSOptionLabel = wbsOption.Label;
                    }
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

        private async Task UpdateUserAssignment(WBSTask taskEntity, WBSTaskDto taskDto, CancellationToken cancellationToken)
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

                    // Validate if the assigned user exists, but only if an ID is actually provided
                    if (!string.IsNullOrEmpty(actualUserId))
                    {
                        var userExists = await _context.Users.AnyAsync(u => u.Id == actualUserId, cancellationToken);
                        if (!userExists)
                        {
                            throw new Exception($"Assigned User with ID '{actualUserId}' not found. Cannot assign task.");
                        }
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
                userTask.TotalHours = taskEntity.PlannedHours.Sum(ph => ph.PlannedHours); // Corrected to use taskEntity.PlannedHours
                userTask.TotalCost = (decimal)userTask.TotalHours * userTask.CostRate;
            }
        }
    }
}

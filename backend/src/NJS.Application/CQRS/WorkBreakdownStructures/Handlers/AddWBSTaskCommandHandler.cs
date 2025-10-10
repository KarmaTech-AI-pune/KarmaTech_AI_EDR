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
            var tempIdToActualIdMap = new Dictionary<string, int>(); // Map FrontendTempId to actual DB Id

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
                // Resolve ParentId for new tasks within the same batch
                if (taskDto.ParentFrontendTempId != null && tempIdToActualIdMap.TryGetValue(taskDto.ParentFrontendTempId, out int actualParentId))
                {
                    taskDto.ParentId = actualParentId;
                }
                else if (taskDto.Level == WBSTaskLevel.Level1)
                {
                    taskDto.ParentId = null; // Level 1 tasks do not have a parent
                }

                // Validate ParentId if provided
                if (taskDto.ParentId.HasValue &&
                    !wbs.Tasks.Any(t => t.Id == taskDto.ParentId.Value && !t.IsDeleted) && // Check existing tasks
                    !tempIdToActualIdMap.ContainsValue(taskDto.ParentId.Value)) // Check tasks created in this batch
                {
                    _logger.LogError("Parent Task with ID {ParentId} not found in WBS {WBSId} or current batch.", taskDto.ParentId.Value, wbs.Id);
                    throw new Exception($"Parent Task with ID {taskDto.ParentId.Value} not found in the WBS or current batch.");
                }

                // --- 2. Create the new WBSTask entity ---
                var taskEntity = new WBSTask
                {
                    WorkBreakdownStructureId = wbs.Id, // Associate with the found or newly created WBS
                    Description = taskDto.Description,
                    Level = taskDto.Level,
                    ParentId = taskDto.ParentId,
                    DisplayOrder = taskDto.DisplayOrder,
                    EstimatedBudget = taskDto.EstimatedBudget,
                    StartDate = taskDto.StartDate,
                    EndDate = taskDto.EndDate,
                    TaskType = taskDto.TaskType,
                    CreatedAt = DateTime.UtcNow,
                    CreatedBy = _currentUser,
                    IsDeleted = false,
                    UserWBSTasks = new List<UserWBSTask>(),
                    PlannedHours = new List<WBSTaskPlannedHour>()
                };

                // Directly assign WBSOptionId and Title from DTO
                taskEntity.WBSOptionId = taskDto.WBSOptionId;
                taskEntity.Title = taskDto.Title; // Assign Title from DTO

                _logger.LogInformation("Mapped WBSTask entity: {@TaskEntity}", taskEntity);

                // --- 3. Add User Assignment and Planned Hours ---
                await UpdateUserAssignment(taskEntity, taskDto, cancellationToken);
                UpdatePlannedHours(taskEntity, taskDto, wbs.ProjectId);

                // --- 4. Add to context and save ---
                _context.WBSTasks.Add(taskEntity);
                _logger.LogInformation("Adding WBSTask to context. Attempting to save changes.");
                await _unitOfWork.SaveChangesAsync(); // Save each task individually
                _logger.LogInformation("WBSTask saved successfully. New Task ID: {TaskId}", taskEntity.Id);

                // Store the mapping for subsequent tasks in the same batch
                if (taskDto.FrontendTempId != null)
                {
                    tempIdToActualIdMap[taskDto.FrontendTempId] = taskEntity.Id;
                }

                // --- 5. Return the new Task ID and populate DTO for frontend display ---
                taskDto.Id = taskEntity.Id; // Populate the ID in the DTO
                if (taskEntity.WBSOptionId.HasValue)
                {
                    var wbsOption = await _wbsOptionRepository.GetByIdAsync(taskEntity.WBSOptionId.Value);
                    if (wbsOption != null)
                    {
                        taskDto.WBSOptionLabel = wbsOption.Label;
                        // Only set DTO Title to label if DTO Title was null or empty, otherwise keep user-provided
                        if (string.IsNullOrEmpty(taskDto.Title))
                        {
                            taskDto.Title = wbsOption.Label;
                        }
                    }
                    else
                    {
                        taskDto.WBSOptionLabel = null;
                        // Fallback to stored ID if label not found, but keep user-provided title if present
                        if (string.IsNullOrEmpty(taskDto.Title))
                        {
                            taskDto.Title = taskEntity.Title;
                        }
                    }
                }
                else
                {
                    taskDto.WBSOptionLabel = null;
                    // Use stored title if no WBSOptionId, but keep user-provided title if present
                    if (string.IsNullOrEmpty(taskDto.Title))
                    {
                        taskDto.Title = taskEntity.Title;
                    }
                }
                createdTasks.Add(taskDto);
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
                // Only proceed if UserId is not null/empty and not a placeholder "string"
                if (!string.IsNullOrEmpty(taskDto.AssignedUserId) && taskDto.AssignedUserId != "string")
                {
                    // Validate if the assigned user exists
                    var userExists = await _context.Users.AnyAsync(u => u.Id == taskDto.AssignedUserId, cancellationToken);

                    if (!userExists)
                    {
                        _logger.LogWarning("Assigned User with ID '{AssignedUserId}' not found. Task will be created without this user assignment.", taskDto.AssignedUserId);
                        // Do not throw an exception, allow task creation without a valid user assignment
                        // Or, if a valid user is strictly required, the user must provide one.
                        // For now, we proceed without assigning the user if not found.
                        return; // Exit the method if user not found and we don't want to assign
                    }

                    // Create new assignment for Manpower task
                    var newUserTask = new UserWBSTask
                    {
                        WBSTask = taskEntity,
                        UserId = taskDto.AssignedUserId,
                        Name = null, // No Name for Manpower tasks
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

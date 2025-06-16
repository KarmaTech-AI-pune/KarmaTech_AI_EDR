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

namespace NJS.Application.CQRS.WorkBreakdownStructures.Handlers
{
    public class AddWBSTaskCommandHandler : IRequestHandler<AddWBSTaskCommand, int>
    {
        private readonly ProjectManagementContext _context;
        private readonly IUnitOfWork _unitOfWork;

        // TODO: Inject ICurrentUserService or similar
        private readonly string _currentUser = "System"; // Placeholder

        public AddWBSTaskCommandHandler(ProjectManagementContext context, IUnitOfWork unitOfWork)
        {
            _context = context;
            _unitOfWork = unitOfWork;
        }

        public async Task<int> Handle(AddWBSTaskCommand request, CancellationToken cancellationToken)
        {
            // --- 1. Find the active WBS for the project ---
            var wbs = await _context.WorkBreakdownStructures
                .Include(w => w.Tasks) // Include tasks to potentially validate ParentId if needed
                .FirstOrDefaultAsync(w => w.ProjectId == request.ProjectId && w.IsActive, cancellationToken);

            if (wbs == null)
            {
                // Option 1: Throw specific exception
                // throw new NotFoundException(nameof(WorkBreakdownStructure), request.ProjectId);
                // Option 2: Return a specific value indicating failure (e.g., 0 or -1)
                // Option 3: Throw generic exception
                throw new Exception($"Active Work Breakdown Structure not found for Project ID {request.ProjectId}. Cannot add task.");
            }

            // Handle ParentId based on task level
            if (request.TaskDto.Level == WBSTaskLevel.Level1)
            {
                request.TaskDto.ParentId = null; // Level 1 tasks do not have a parent
            }

            // Optional: Validate ParentId if provided
            if (request.TaskDto.ParentId.HasValue && !wbs.Tasks.Any(t => t.Id == request.TaskDto.ParentId.Value && !t.IsDeleted))
            {
                throw new Exception($"Parent Task with ID {request.TaskDto.ParentId.Value} not found in the WBS.");
            }

            // --- 2. Create the new WBSTask entity ---
            var taskDto = request.TaskDto;
            var taskEntity = new WBSTask
            {
                WorkBreakdownStructureId = wbs.Id, // Associate with the found WBS
                Title = taskDto.Title,
                Description = taskDto.Description,
                Level = taskDto.Level, // No cast needed now
                ParentId = taskDto.ParentId,
                DisplayOrder = taskDto.DisplayOrder, // Consider logic to determine next DisplayOrder if needed
                EstimatedBudget = taskDto.EstimatedBudget,
                StartDate = taskDto.StartDate,
                EndDate = taskDto.EndDate,
                TaskType = taskDto.TaskType, // Set TaskType
                CreatedAt = DateTime.UtcNow,
                CreatedBy = _currentUser,
                IsDeleted = false,
                UserWBSTasks = new List<UserWBSTask>(),
                MonthlyHours = new List<WBSTaskMonthlyHour>()
            };

            // --- 3. Add User Assignment and Monthly Hours ---
            // Using copied helper methods (could be refactored later)
            await UpdateUserAssignment(taskEntity, taskDto, cancellationToken);
            UpdateMonthlyHours(taskEntity, taskDto, wbs.ProjectId);

            // --- 4. Add to context and save ---
            _context.WBSTasks.Add(taskEntity);
            await _unitOfWork.SaveChangesAsync();

            // --- 5. Return the new Task ID ---
            return taskEntity.Id;
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
                        throw new Exception($"Assigned User with ID '{taskDto.AssignedUserId}' not found. Cannot assign task.");
                    }

                    // Create new assignment for Manpower task
                    var newUserTask = new UserWBSTask
                    {
                        WBSTask = taskEntity,
                        UserId = taskDto.AssignedUserId,
                        Name = null, // No Name for Manpower tasks
                        CostRate = taskDto.CostRate,
                        Unit = taskDto.ResourceUnit,
                        TotalHours = taskEntity.MonthlyHours.Sum(mh => mh.PlannedHours),
                        TotalCost = (decimal)taskEntity.MonthlyHours.Sum(mh => mh.PlannedHours) * taskDto.CostRate,
                        CreatedAt = DateTime.UtcNow,
                        CreatedBy = _currentUser,
                        ResourceRole = taskDto.ResourceRole // Add ResourceRole
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
                        TotalHours = taskEntity.MonthlyHours.Sum(mh => mh.PlannedHours),
                        TotalCost = (decimal)taskEntity.MonthlyHours.Sum(mh => mh.PlannedHours) * taskDto.CostRate,
                        CreatedAt = DateTime.UtcNow,
                        CreatedBy = _currentUser,
                        ResourceRole = taskDto.ResourceRole // Add ResourceRole
                    };
                    taskEntity.UserWBSTasks.Add(newUserTask);
                }
            }
        }

        private void UpdateMonthlyHours(WBSTask taskEntity, WBSTaskDto taskDto, int projectId)
        {
            // Ensure a WBSTaskMonthlyHourHeader exists for this project and task type
            // Or create a new one if it doesn't exist
            var monthlyHourHeader = _context.WBSTaskMonthlyHourHeaders
                .FirstOrDefault(h => h.ProjectId == projectId && h.TaskType == taskEntity.TaskType);

            if (monthlyHourHeader == null)
            {
                monthlyHourHeader = new WBSTaskMonthlyHourHeader
                {
                    ProjectId = projectId,
                    CreatedAt = DateTime.UtcNow,
                    CreatedBy = _currentUser,
                    TaskType = taskEntity.TaskType,
                    StatusId = (int)PMWorkflowStatusEnum.Initial // Default status
                };
                _context.WBSTaskMonthlyHourHeaders.Add(monthlyHourHeader);
            }

            // Add new ones from DTO
            foreach (var mhDto in taskDto.MonthlyHours)
            {
                var newMh = new WBSTaskMonthlyHour
                {
                    WBSTask = taskEntity, // EF Core should link this
                    WBSTaskMonthlyHourHeader = monthlyHourHeader, // Link to the header
                    Year = mhDto.Year.ToString(),
                    Month = mhDto.Month,
                    PlannedHours = mhDto.PlannedHours,
                    CreatedAt = DateTime.UtcNow,
                    CreatedBy = _currentUser
                };
                taskEntity.MonthlyHours.Add(newMh);
            }

            // Recalculate TotalHours/Cost on the UserWBSTask if it exists (it should have been added just before)
            var userTask = taskEntity.UserWBSTasks.FirstOrDefault();
            if (userTask != null)
            {
                userTask.TotalHours = taskEntity.MonthlyHours.Sum(mh => mh.PlannedHours);
                userTask.TotalCost = (decimal)userTask.TotalHours * userTask.CostRate;
            }
        }
    }
}

using MediatR;
using Microsoft.EntityFrameworkCore;
using NJS.Application.CQRS.WorkBreakdownStructures.Commands;
using NJS.Application.Dtos;
using NJS.Domain.Database;
using NJS.Domain.Entities;
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
                Level = (NJS.Domain.Entities.WBSTaskLevel)(int)taskDto.Level, // Cast via int for cross-namespace enum
                ParentId = taskDto.ParentId,
                DisplayOrder = taskDto.DisplayOrder, // Consider logic to determine next DisplayOrder if needed
                EstimatedBudget = taskDto.EstimatedBudget,
                StartDate = taskDto.StartDate,
                EndDate = taskDto.EndDate,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = _currentUser,
                IsDeleted = false,
                UserWBSTasks = new List<UserWBSTask>(),
                MonthlyHours = new List<WBSTaskMonthlyHour>()
            };

            // --- 3. Add User Assignment and Monthly Hours ---
            // Using copied helper methods (could be refactored later)
            UpdateUserAssignment(taskEntity, taskDto);
            UpdateMonthlyHours(taskEntity, taskDto);

            // --- 4. Add to context and save ---
            _context.WBSTasks.Add(taskEntity);
            await _unitOfWork.SaveChangesAsync();

            // --- 5. Return the new Task ID ---
            return taskEntity.Id;
        }

        // --- Helper methods copied from SetWBSCommandHandler ---
        // (Consider refactoring into a shared service/utility class later)

        private void UpdateUserAssignment(WBSTask taskEntity, WBSTaskDto taskDto)
        {
            // This method assumes taskEntity.UserWBSTasks is initialized
            // For a new task, we only need the 'else' part of the original logic

            if (!string.IsNullOrEmpty(taskDto.AssignedUserId))
            {
                // Create new assignment
                var newUserTask = new UserWBSTask
                {
                    WBSTask = taskEntity, // EF Core should link this via navigation property
                    UserId = taskDto.AssignedUserId,
                    CostRate = taskDto.CostRate,
                    ODC = taskDto.ODC,
                    // Calculate based on current monthly hours (which should be added by UpdateMonthlyHours)
                    TotalHours = taskEntity.MonthlyHours.Sum(mh => mh.PlannedHours),
                    TotalCost = (decimal)taskEntity.MonthlyHours.Sum(mh => mh.PlannedHours) * taskDto.CostRate + taskDto.ODC,
                    CreatedAt = DateTime.UtcNow,
                    CreatedBy = _currentUser
                };
                taskEntity.UserWBSTasks.Add(newUserTask);
                // Context should track this automatically as it's added to the tracked taskEntity
            }
            // No need to handle removal for a new task
        }

        private void UpdateMonthlyHours(WBSTask taskEntity, WBSTaskDto taskDto)
        {
            // This method assumes taskEntity.MonthlyHours is initialized
            // For a new task, we only need the 'Add new ones' part

            // Add new ones from DTO
            foreach (var mhDto in taskDto.MonthlyHours)
            {
                var newMh = new WBSTaskMonthlyHour
                {
                    WBSTask = taskEntity, // EF Core should link this
                    Year = mhDto.Year.ToString(),
                    Month = mhDto.Month,
                    PlannedHours = mhDto.PlannedHours,
                    CreatedAt = DateTime.UtcNow,
                    CreatedBy = _currentUser
                };
                taskEntity.MonthlyHours.Add(newMh);
                // Context should track this automatically
            }

            // Recalculate TotalHours/Cost on the UserWBSTask if it exists (it should have been added just before)
            var userTask = taskEntity.UserWBSTasks.FirstOrDefault();
            if (userTask != null)
            {
                userTask.TotalHours = taskEntity.MonthlyHours.Sum(mh => mh.PlannedHours);
                userTask.TotalCost = (decimal)userTask.TotalHours * userTask.CostRate + userTask.ODC;
            }
        }
    }
}

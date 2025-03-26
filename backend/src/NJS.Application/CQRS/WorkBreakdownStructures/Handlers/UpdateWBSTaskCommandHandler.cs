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
    public class UpdateWBSTaskCommandHandler : IRequestHandler<UpdateWBSTaskCommand, Unit>
    {
        private readonly ProjectManagementContext _context;
        private readonly IUnitOfWork _unitOfWork;

        // TODO: Inject ICurrentUserService or similar
        private readonly string _currentUser = "System"; // Placeholder

        public UpdateWBSTaskCommandHandler(ProjectManagementContext context, IUnitOfWork unitOfWork)
        {
            _context = context;
            _unitOfWork = unitOfWork;
        }

        public async Task<Unit> Handle(UpdateWBSTaskCommand request, CancellationToken cancellationToken)
        {
            // --- 1. Find the task to update, including related data ---
            var taskEntity = await _context.WBSTasks
                .Include(t => t.WorkBreakdownStructure) // Include WBS to check ProjectId
                .Include(t => t.UserWBSTasks)
                .Include(t => t.MonthlyHours)
                .FirstOrDefaultAsync(t => t.Id == request.TaskId && !t.IsDeleted, cancellationToken);

            if (taskEntity == null)
            {
                // throw new NotFoundException(nameof(WBSTask), request.TaskId);
                throw new Exception($"WBSTask with ID {request.TaskId} not found.");
            }

            // --- 2. Verify task belongs to the correct project's WBS ---
            if (taskEntity.WorkBreakdownStructure == null || taskEntity.WorkBreakdownStructure.ProjectId != request.ProjectId)
            {
                // Or throw an authorization/forbidden exception
                throw new Exception($"Task {request.TaskId} does not belong to Project {request.ProjectId}.");
            }

            // --- 3. Map updated properties from DTO ---
            var taskDto = request.TaskDto;
            taskEntity.Title = taskDto.Title;
            taskEntity.Description = taskDto.Description;
            taskEntity.Level = (NJS.Domain.Entities.WBSTaskLevel)(int)taskDto.Level; // Cast via int for cross-namespace enum
            taskEntity.ParentId = taskDto.ParentId; // Consider validating ParentId exists within the same WBS
            taskEntity.DisplayOrder = taskDto.DisplayOrder;
            taskEntity.EstimatedBudget = taskDto.EstimatedBudget;
            taskEntity.StartDate = taskDto.StartDate;
            taskEntity.EndDate = taskDto.EndDate;
            taskEntity.UpdatedAt = DateTime.UtcNow;
            taskEntity.UpdatedBy = _currentUser;
            // IsDeleted should not be updated here; use a separate Delete command

            // --- 4. Update User Assignment and Monthly Hours ---
            // Using copied helper methods (could be refactored later)
            UpdateUserAssignment(taskEntity, taskDto);
            UpdateMonthlyHours(taskEntity, taskDto);

            // --- 5. Save Changes ---
            // EF Core tracks changes to taskEntity and its related collections
            await _unitOfWork.SaveChangesAsync();

            return Unit.Value;
        }

        // --- Helper methods copied from SetWBSCommandHandler ---
        // (Consider refactoring into a shared service/utility class later)

        private void UpdateUserAssignment(WBSTask taskEntity, WBSTaskDto taskDto)
        {
            var existingUserTask = taskEntity.UserWBSTasks.FirstOrDefault();

            if (!string.IsNullOrEmpty(taskDto.AssignedUserId))
            {
                if (existingUserTask != null)
                {
                    // Update existing assignment
                    existingUserTask.UserId = taskDto.AssignedUserId;
                    existingUserTask.CostRate = taskDto.CostRate;
                    existingUserTask.ODC = taskDto.ODC;
                    existingUserTask.TotalHours = taskEntity.MonthlyHours.Sum(mh => mh.PlannedHours); // Recalculate
                    existingUserTask.TotalCost = (decimal)existingUserTask.TotalHours * existingUserTask.CostRate + existingUserTask.ODC; // Recalculate
                    existingUserTask.UpdatedAt = DateTime.UtcNow;
                    existingUserTask.UpdatedBy = _currentUser;
                }
                else
                {
                    // Create new assignment
                    var newUserTask = new UserWBSTask
                    {
                        WBSTask = taskEntity,
                        UserId = taskDto.AssignedUserId,
                        CostRate = taskDto.CostRate,
                        ODC = taskDto.ODC,
                        TotalHours = taskEntity.MonthlyHours.Sum(mh => mh.PlannedHours), // Calculate based on current monthly hours
                        TotalCost = (decimal)taskEntity.MonthlyHours.Sum(mh => mh.PlannedHours) * taskDto.CostRate + taskDto.ODC,
                        CreatedAt = DateTime.UtcNow,
                        CreatedBy = _currentUser
                    };
                    taskEntity.UserWBSTasks.Add(newUserTask);
                }
            }
            else if (existingUserTask != null)
            {
                // Remove existing assignment if AssignedUserId is null/empty in DTO
                _context.UserWBSTasks.Remove(existingUserTask);
                // Or taskEntity.UserWBSTasks.Remove(existingUserTask); // EF Core should handle removal from collection
            }
        }

        private void UpdateMonthlyHours(WBSTask taskEntity, WBSTaskDto taskDto)
        {
            // Simple approach: Remove existing and add new ones

            // Remove existing
            var existingMonthlyHours = taskEntity.MonthlyHours.ToList();
            foreach (var existingHour in existingMonthlyHours)
            {
                _context.Set<WBSTaskMonthlyHour>().Remove(existingHour);
            }
            // taskEntity.MonthlyHours.Clear(); // Let EF Core manage the collection state after Remove

            // Add new ones from DTO
            foreach (var mhDto in taskDto.MonthlyHours)
            {
                var newMh = new WBSTaskMonthlyHour
                {
                    WBSTask = taskEntity,
                    Year = mhDto.Year.ToString(),
                    Month = mhDto.Month,
                    PlannedHours = mhDto.PlannedHours,
                    CreatedAt = DateTime.UtcNow, // Should this be UpdatedAt? Or track separately? Using CreatedAt for now.
                    CreatedBy = _currentUser
                };
                taskEntity.MonthlyHours.Add(newMh); // Add to the navigation property collection
            }

            // Recalculate TotalHours/Cost on the UserWBSTask if it exists
            var userTask = taskEntity.UserWBSTasks.FirstOrDefault();
            if (userTask != null)
            {
                userTask.TotalHours = taskEntity.MonthlyHours.Sum(mh => mh.PlannedHours);
                userTask.TotalCost = (decimal)userTask.TotalHours * userTask.CostRate + userTask.ODC;
                userTask.UpdatedAt = DateTime.UtcNow; // Update timestamp on user task as well
                userTask.UpdatedBy = _currentUser;
            }
        }
    }
}

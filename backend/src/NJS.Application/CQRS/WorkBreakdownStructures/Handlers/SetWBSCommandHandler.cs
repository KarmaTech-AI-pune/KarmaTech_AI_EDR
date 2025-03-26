using MediatR;
using Microsoft.EntityFrameworkCore;
using NJS.Application.CQRS.WorkBreakdownStructures.Commands;
using NJS.Application.Dtos;
using NJS.Domain.Database;
using NJS.Domain.Entities;
using NJS.Domain.UnitWork; // Assuming IUnitOfWork is here
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace NJS.Application.CQRS.WorkBreakdownStructures.Handlers
{
    public class SetWBSCommandHandler : IRequestHandler<SetWBSCommand, Unit>
    {
        private readonly ProjectManagementContext _context;
        private readonly IUnitOfWork _unitOfWork; // Inject Unit of Work

        // TODO: Inject ICurrentUserService or similar to get current user for CreatedBy/UpdatedBy
        private readonly string _currentUser = "System"; // Placeholder

        public SetWBSCommandHandler(ProjectManagementContext context, IUnitOfWork unitOfWork)
        {
            _context = context;
            _unitOfWork = unitOfWork;
        }

        public async Task<Unit> Handle(SetWBSCommand request, CancellationToken cancellationToken)
        {
            // --- 1. Fetch or Create WorkBreakdownStructure ---
            var wbs = await _context.WorkBreakdownStructures
                .Include(w => w.Tasks)
                    .ThenInclude(t => t.UserWBSTasks)
                .Include(w => w.Tasks)
                    .ThenInclude(t => t.MonthlyHours)
                .FirstOrDefaultAsync(w => w.ProjectId == request.ProjectId, cancellationToken);

            if (wbs == null)
            {
                // Create new WBS if it doesn't exist
                wbs = new WorkBreakdownStructure
                {
                    ProjectId = request.ProjectId,
                    IsActive = true,
                    Version = "1.0", // Initial version
                    CreatedAt = DateTime.UtcNow,
                    CreatedBy = _currentUser,
                    Tasks = new List<WBSTask>() // Initialize tasks collection
                };
                _context.WorkBreakdownStructures.Add(wbs);
                // Need to save here to get wbs.Id if tasks are added immediately?
                // Or rely on EF Core relationship fixup. Let's try relying on EF Core first.
            }
            else
            {
                // Optionally update WBS metadata if needed (e.g., version)
                wbs.Version = CalculateNextVersion(wbs.Version); // Example version increment
            }

            var existingTasks = wbs.Tasks.ToList();
            var incomingTasksDto = request.Tasks;
            var incomingTaskIds = incomingTasksDto.Where(dto => dto.Id > 0).Select(dto => dto.Id).ToList();

            // --- 2. Handle Deletions ---
            var tasksToDelete = existingTasks.Where(et => !et.IsDeleted && !incomingTaskIds.Contains(et.Id)).ToList();
            foreach (var taskToDelete in tasksToDelete)
            {
                taskToDelete.IsDeleted = true; // Soft delete
                taskToDelete.UpdatedAt = DateTime.UtcNow;
                taskToDelete.UpdatedBy = _currentUser;
                // EF Core should handle cascading deletes/updates for related entities if configured,
                // otherwise, manually handle UserWBSTasks and MonthlyHours if needed.
            }

            // --- 3. Handle Additions and Updates ---
            // Dictionary to map temporary frontend IDs (if any) to newly created task entities
            // For now, assuming Id=0 means new, so no complex mapping needed yet.

            foreach (var taskDto in incomingTasksDto)
            {
                WBSTask taskEntity;

                if (taskDto.Id > 0)
                {
                    // --- Update Existing Task ---
                    taskEntity = existingTasks.FirstOrDefault(et => et.Id == taskDto.Id);
                    if (taskEntity == null || taskEntity.IsDeleted) continue; // Skip if not found or already marked deleted

                    // Map basic properties
                    taskEntity.Title = taskDto.Title;
                    taskEntity.Description = taskDto.Description;
                    taskEntity.Level = (NJS.Domain.Entities.WBSTaskLevel)(int)taskDto.Level; // Cast via int for cross-namespace enum
                    taskEntity.ParentId = taskDto.ParentId; // Assuming ParentId from DTO is correct DB ID
                    taskEntity.DisplayOrder = taskDto.DisplayOrder;
                    taskEntity.EstimatedBudget = taskDto.EstimatedBudget;
                    taskEntity.StartDate = taskDto.StartDate;
                    taskEntity.EndDate = taskDto.EndDate;
                    taskEntity.UpdatedAt = DateTime.UtcNow;
                    taskEntity.UpdatedBy = _currentUser;
                    taskEntity.IsDeleted = false; // Ensure it's not marked deleted if it's being updated

                    // Update User Assignment (assuming one user per task)
                    UpdateUserAssignment(taskEntity, taskDto);

                    // Update Monthly Hours
                    UpdateMonthlyHours(taskEntity, taskDto);
                }
                else
                {
                    // --- Add New Task ---
                    taskEntity = new WBSTask
                    {
                        WorkBreakdownStructure = wbs, // Associate with the WBS
                        Title = taskDto.Title,
                        Description = taskDto.Description,
                        Level = (NJS.Domain.Entities.WBSTaskLevel)(int)taskDto.Level, // Cast via int for cross-namespace enum
                        ParentId = taskDto.ParentId, // Assuming ParentId from DTO is correct DB ID
                        DisplayOrder = taskDto.DisplayOrder,
                        EstimatedBudget = taskDto.EstimatedBudget,
                        StartDate = taskDto.StartDate,
                        EndDate = taskDto.EndDate,
                        CreatedAt = DateTime.UtcNow,
                        CreatedBy = _currentUser,
                        IsDeleted = false,
                        UserWBSTasks = new List<UserWBSTask>(),
                        MonthlyHours = new List<WBSTaskMonthlyHour>()
                    };

                    // Add User Assignment
                    UpdateUserAssignment(taskEntity, taskDto); // Use the same logic

                    // Add Monthly Hours
                    UpdateMonthlyHours(taskEntity, taskDto); // Use the same logic

                    _context.WBSTasks.Add(taskEntity);
                    // Add to the WBS collection manually if EF Core doesn't do it automatically
                    if (!wbs.Tasks.Contains(taskEntity))
                    {
                        wbs.Tasks.Add(taskEntity);
                    }
                }
            }

            // --- 4. Save Changes ---
            await _unitOfWork.SaveChangesAsync(); // Use correct method name

            return Unit.Value;
        }

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
                    // TotalHours and TotalCost are calculated fields in DTO, UserWBSTask might store raw hours? Check entity.
                    // Assuming UserWBSTask.TotalHours should be updated based on WBSTask.MonthlyHours sum
                    existingUserTask.TotalHours = taskEntity.MonthlyHours.Sum(mh => mh.PlannedHours);
                    existingUserTask.TotalCost = (decimal)existingUserTask.TotalHours * existingUserTask.CostRate + existingUserTask.ODC;
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
                    // Context should track this automatically as it's added to the tracked taskEntity
                }
            }
            else if (existingUserTask != null)
            {
                // Remove existing assignment if AssignedUserId is null/empty in DTO
                _context.UserWBSTasks.Remove(existingUserTask);
                // Or taskEntity.UserWBSTasks.Remove(existingUserTask);
            }
        }

        private void UpdateMonthlyHours(WBSTask taskEntity, WBSTaskDto taskDto)
        {
            // Simple approach: Remove existing and add new ones
            // More complex: Diffing (add/update/delete individual months)

            // Remove existing
            var existingMonthlyHours = taskEntity.MonthlyHours.ToList();
            foreach (var existingHour in existingMonthlyHours)
            {
                _context.Set<WBSTaskMonthlyHour>().Remove(existingHour);
                // Or taskEntity.MonthlyHours.Remove(existingHour);
            }
            taskEntity.MonthlyHours.Clear(); // Ensure collection is clear if Remove doesn't update it immediately

            // Add new ones from DTO
            foreach (var mhDto in taskDto.MonthlyHours)
            {
                var newMh = new WBSTaskMonthlyHour
                {
                    WBSTask = taskEntity,
                    Year = mhDto.Year.ToString(),
                    Month = mhDto.Month,
                    PlannedHours = mhDto.PlannedHours,
                    CreatedAt = DateTime.UtcNow,
                    CreatedBy = _currentUser
                    // ActualHours = null // Initialize if tracking actuals
                };
                taskEntity.MonthlyHours.Add(newMh);
                // Context should track this automatically
            }

            // Recalculate TotalHours on the UserWBSTask if it exists
             var userTask = taskEntity.UserWBSTasks.FirstOrDefault();
             if(userTask != null) {
                 userTask.TotalHours = taskEntity.MonthlyHours.Sum(mh => mh.PlannedHours);
                 userTask.TotalCost = (decimal)userTask.TotalHours * userTask.CostRate + userTask.ODC;
             }
        }

        private string CalculateNextVersion(string currentVersion)
        {
            if (string.IsNullOrEmpty(currentVersion)) return "1.0";
            if (decimal.TryParse(currentVersion, out decimal versionNumber))
            {
                return (versionNumber + 0.1m).ToString("F1"); // Increment minor version
            }
            return currentVersion + "_updated"; // Fallback
        }
    }
}

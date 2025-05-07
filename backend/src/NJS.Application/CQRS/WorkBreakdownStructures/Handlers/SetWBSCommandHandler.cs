using MediatR;
using Microsoft.EntityFrameworkCore;
using NJS.Application.CQRS.WorkBreakdownStructures.Commands;
using NJS.Application.Dtos;
using NJS.Domain.Database;
using NJS.Domain.Entities;
using NJS.Domain.Enums; // Add import for WBSTaskLevel
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

            // --- 3. Handle Additions and Updates (Two-Pass Save Logic) ---
            var tempIdToNewEntityMap = new Dictionary<string, WBSTask>();
            var newChildToTempParentIdMap = new Dictionary<WBSTask, string>();
            var allProcessedEntities = new List<WBSTask>(); // Keep track of entities processed in pass 1

            // --- Pass 1: Create/Update Entities, Identify Relationships for New Tasks ---
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
                    taskEntity.Level = taskDto.Level;
                    // ParentId from DTO should be correct if parent already exists
                    taskEntity.ParentId = taskDto.ParentId;
                    taskEntity.DisplayOrder = taskDto.DisplayOrder;
                    taskEntity.EstimatedBudget = taskDto.EstimatedBudget;
                    taskEntity.StartDate = taskDto.StartDate;
                    taskEntity.EndDate = taskDto.EndDate;
                    taskEntity.TaskType = taskDto.TaskType; // Update TaskType
                    taskEntity.UpdatedAt = DateTime.UtcNow;
                    taskEntity.UpdatedBy = _currentUser;
                    taskEntity.IsDeleted = false; // Ensure it's not marked deleted if it's being updated

                    // Update User Assignment (assuming one user per task)
                    UpdateUserAssignment(taskEntity, taskDto);

                    // Update Monthly Hours
                    UpdateMonthlyHours(taskEntity, taskDto);

                    allProcessedEntities.Add(taskEntity); // Track processed entity
                }
                else // Id == 0, means new task
                {
                    // --- Add New Task ---
                    taskEntity = new WBSTask
                    {
                        WorkBreakdownStructure = wbs, // Associate with the WBS
                        Title = taskDto.Title,
                        Description = taskDto.Description,
                        Level = taskDto.Level,
                        // ParentId might be null if parent is also new, or set if parent exists
                        ParentId = taskDto.ParentId,
                        DisplayOrder = taskDto.DisplayOrder,
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

                    // Add User Assignment
                    UpdateUserAssignment(taskEntity, taskDto); // Use the same logic

                    // Add Monthly Hours
                    UpdateMonthlyHours(taskEntity, taskDto); // Use the same logic

                    _context.WBSTasks.Add(taskEntity);
                    if (!wbs.Tasks.Contains(taskEntity)) // Ensure association
                    {
                        wbs.Tasks.Add(taskEntity);
                    }
                    allProcessedEntities.Add(taskEntity); // Track processed entity

                    // Store mapping for new tasks using their temporary frontend ID
                    if (!string.IsNullOrEmpty(taskDto.FrontendTempId))
                    {
                        tempIdToNewEntityMap[taskDto.FrontendTempId] = taskEntity;
                    }

                    // If the parent is also new (indicated by ParentFrontendTempId), store for Pass 2
                    if (!string.IsNullOrEmpty(taskDto.ParentFrontendTempId))
                    {
                        newChildToTempParentIdMap[taskEntity] = taskDto.ParentFrontendTempId;
                        taskEntity.ParentId = null; // Ensure ParentId is null for the first save
                    }
                }
            }

            // --- 4. Save Changes (Pass 1) ---
            // This save generates real IDs for all newly added entities
            await _unitOfWork.SaveChangesAsync();

            // --- 5. Pass 2: Link New Children to New Parents ---
            bool requiresSecondSave = false;
            foreach (var kvp in newChildToTempParentIdMap)
            {
                var childEntity = kvp.Key;
                var tempParentId = kvp.Value;

                if (tempIdToNewEntityMap.TryGetValue(tempParentId, out var parentEntity))
                {
                    // Check if parentEntity has a valid ID (should have after Save 1)
                    if (parentEntity.Id > 0)
                    {
                        childEntity.ParentId = parentEntity.Id;
                        requiresSecondSave = true;
                    }
                    else
                    {
                        // Log or handle error: Parent entity was found but has no valid ID after first save
                        Console.Error.WriteLine($"Error: Parent entity for temp ID {tempParentId} did not get a valid DB ID.");
                    }
                }
                else
                {
                    // Log or handle error: Parent entity not found for temp ID
                     Console.Error.WriteLine($"Error: Parent entity not found for temp ID {tempParentId}. Cannot link child {childEntity.Title}.");
                }
            }

            // --- 6. Save Changes (Pass 2) ---
            // This save persists the ParentId links established in Pass 2
            if (requiresSecondSave)
            {
                await _unitOfWork.SaveChangesAsync();
            }

            return Unit.Value;
        }

        private void UpdateUserAssignment(WBSTask taskEntity, WBSTaskDto taskDto)
        {
            var existingUserTask = taskEntity.UserWBSTasks.FirstOrDefault();

            // Handle Manpower tasks
            if (taskEntity.TaskType == TaskType.Manpower)
            {
                // Only proceed if UserId is not null/empty
                if (!string.IsNullOrEmpty(taskDto.AssignedUserId))
                {
                    if (existingUserTask != null)
                    {
                        // Update existing assignment for Manpower task
                        existingUserTask.UserId = taskDto.AssignedUserId;
                        existingUserTask.Name = null; // Reset Name for Manpower tasks
                        existingUserTask.CostRate = taskDto.CostRate;
                        existingUserTask.Unit = taskDto.ResourceUnit;
                        existingUserTask.TotalHours = taskEntity.MonthlyHours.Sum(mh => mh.PlannedHours);
                        existingUserTask.TotalCost = (decimal)existingUserTask.TotalHours * existingUserTask.CostRate;
                        existingUserTask.UpdatedAt = DateTime.UtcNow;
                        existingUserTask.UpdatedBy = _currentUser;
                    }
                    else
                    {
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
                            CreatedBy = _currentUser
                        };
                        taskEntity.UserWBSTasks.Add(newUserTask);
                    }
                }
                else if (existingUserTask != null)
                {
                    // Remove existing assignment if no valid UserId
                    _context.UserWBSTasks.Remove(existingUserTask);
                }
            }
            // Handle ODC tasks
            else if (taskEntity.TaskType == TaskType.ODC)
            {
                // Only proceed if Name is not null/empty
                if (!string.IsNullOrEmpty(taskDto.ResourceName))
                {
                    if (existingUserTask != null)
                    {
                        // Update existing assignment for ODC task
                        existingUserTask.UserId = null; // Reset UserId for ODC tasks
                        existingUserTask.Name = taskDto.ResourceName;
                        existingUserTask.CostRate = taskDto.CostRate;
                        existingUserTask.Unit = taskDto.ResourceUnit;
                        existingUserTask.TotalHours = taskEntity.MonthlyHours.Sum(mh => mh.PlannedHours);
                        existingUserTask.TotalCost = (decimal)existingUserTask.TotalHours * existingUserTask.CostRate;
                        existingUserTask.UpdatedAt = DateTime.UtcNow;
                        existingUserTask.UpdatedBy = _currentUser;
                    }
                    else
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
                            CreatedBy = _currentUser
                        };
                        taskEntity.UserWBSTasks.Add(newUserTask);
                    }
                }
                else if (existingUserTask != null)
                {
                    // Remove existing assignment if no valid Name
                    _context.UserWBSTasks.Remove(existingUserTask);
                }
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
                 userTask.TotalCost = (decimal)userTask.TotalHours * userTask.CostRate;
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

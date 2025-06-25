using MediatR;
using Microsoft.EntityFrameworkCore;
using NJS.Application.CQRS.WorkBreakdownStructures.Commands;
using NJS.Application.Dtos;
using NJS.Domain.Database;
using NJS.Domain.Entities;
using NJS.Domain.UnitWork;

namespace NJS.Application.CQRS.WorkBreakdownStructures.Handlers
{
    public class UpdateWBSTaskCommandHandler : IRequestHandler<UpdateWBSTaskCommand, Unit>
    {
        private readonly ProjectManagementContext _context;
        private readonly IUnitOfWork _unitOfWork;
        private readonly string _currentUser = "System";

        public UpdateWBSTaskCommandHandler(ProjectManagementContext context, IUnitOfWork unitOfWork)
        {
            _context = context;
            _unitOfWork = unitOfWork;
        }

        public async Task<Unit> Handle(UpdateWBSTaskCommand request, CancellationToken cancellationToken)
        {
            var taskEntity = await _context.WBSTasks
                .Include(t => t.WorkBreakdownStructure) 
                .Include(t => t.UserWBSTasks)
                .Include(t => t.MonthlyHours)
                .FirstOrDefaultAsync(t => t.Id == request.TaskId && !t.IsDeleted, cancellationToken);

            if (taskEntity == null)
            {
                throw new Exception($"WBSTask with ID {request.TaskId} not found.");
            }

            if (taskEntity.WorkBreakdownStructure == null || taskEntity.WorkBreakdownStructure.ProjectId != request.ProjectId)
            {
                throw new Exception($"Task {request.TaskId} does not belong to Project {request.ProjectId}.");
            }

            var taskDto = request.TaskDto;
            taskEntity.Title = taskDto.Title;
            taskEntity.Description = taskDto.Description;
            taskEntity.Level = taskDto.Level; 
            taskEntity.ParentId = taskDto.ParentId; 
            taskEntity.DisplayOrder = taskDto.DisplayOrder;
            taskEntity.EstimatedBudget = taskDto.EstimatedBudget;
            taskEntity.StartDate = taskDto.StartDate;
            taskEntity.EndDate = taskDto.EndDate;
            taskEntity.TaskType = taskDto.TaskType; 
            taskEntity.UpdatedAt = DateTime.UtcNow;
            taskEntity.UpdatedBy = _currentUser;           
            UpdateUserAssignment(taskEntity, taskDto);
            UpdateMonthlyHours(request.ProjectId, taskDto.TaskType,taskEntity, taskDto);
           
            await _unitOfWork.SaveChangesAsync();

            return Unit.Value;
        }
       

        private void UpdateUserAssignment(WBSTask taskEntity, WBSTaskDto taskDto)
        {
            var existingUserTask = taskEntity.UserWBSTasks.FirstOrDefault();

            if (taskEntity.TaskType == TaskType.Manpower)
            {
                if (!string.IsNullOrEmpty(taskDto.AssignedUserId))
                {
                    if (existingUserTask != null)
                    {
                        existingUserTask.UserId = taskDto.AssignedUserId;
                        existingUserTask.Name = null; 
                        existingUserTask.CostRate = taskDto.CostRate;
                        existingUserTask.Unit = taskDto.ResourceUnit;
                        existingUserTask.TotalHours = taskDto.MonthlyHours.Sum(mh => mh.PlannedHours);
                        existingUserTask.TotalCost = (decimal)taskDto.TotalHours * taskDto.CostRate;
                        existingUserTask.UpdatedAt = DateTime.UtcNow;
                        existingUserTask.UpdatedBy = _currentUser;
                        existingUserTask.ResourceRoleId = taskDto.ResourceRoleId; // Update ResourceRoleId
                    }
                    else
                    {
                        var newUserTask = new UserWBSTask
                        {
                            WBSTask = taskEntity,
                            UserId = taskDto.AssignedUserId,
                            Name = null, 
                            CostRate = taskDto.CostRate,
                            Unit = taskDto.ResourceUnit,
                            TotalHours = taskEntity.MonthlyHours.Sum(mh => mh.PlannedHours),
                            TotalCost = (decimal)taskEntity.MonthlyHours.Sum(mh => mh.PlannedHours) * taskDto.CostRate,
                            CreatedAt = DateTime.UtcNow,
                            CreatedBy = _currentUser,
                            ResourceRoleId = taskDto.ResourceRoleId // Add ResourceRoleId
                        };
                        taskEntity.UserWBSTasks.Add(newUserTask);
                    }
                }
                else if (existingUserTask != null)
                {
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
                        existingUserTask.ResourceRoleId = taskDto.ResourceRoleId; // Update ResourceRoleId
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
                            CreatedBy = _currentUser,
                            ResourceRoleId = taskDto.ResourceRoleId // Add ResourceRoleId
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

        private WBSTaskMonthlyHourHeader GetMonthlyHourHeader(int projectId, TaskType taskType)
        {
            var header =  _context.Set<WBSTaskMonthlyHourHeader>()
                   .FirstOrDefault(h => h.ProjectId == projectId && h.TaskType == taskType);

            return header!;
        }
        private void UpdateMonthlyHours(int projectId, TaskType taskType,WBSTask taskEntity, WBSTaskDto taskDto)
        {

            var header =  GetMonthlyHourHeader(projectId, taskType);           

            var existingMonthlyHours = taskEntity.MonthlyHours.ToList();

            var existing = taskEntity.MonthlyHours.ToDictionary(m => (m.Year, m.Month, m.WBSTaskMonthlyHourHeaderId));

            foreach (var mhDto in taskDto.MonthlyHours)
            {
                var key = (mhDto.Year.ToString(), mhDto.Month, header.Id);
                if (existing.TryGetValue(key, out var existingMh))
                {
                    existingMh.PlannedHours = mhDto.PlannedHours;
                    existingMh.UpdatedAt = DateTime.UtcNow;
                    existingMh.UpdatedBy = _currentUser;
                }
                else
                {
                    var newMh = new WBSTaskMonthlyHour
                    {
                        WBSTask = taskEntity,
                        WBSTaskMonthlyHourHeader = header,
                        WBSTaskMonthlyHourHeaderId = header.Id,
                        Year = mhDto.Year.ToString(),
                        Month = mhDto.Month,
                        PlannedHours = mhDto.PlannedHours,
                        CreatedAt = DateTime.UtcNow,
                        CreatedBy = _currentUser
                    };
                    taskEntity.MonthlyHours.Add(newMh);
                    header.MonthlyHours.Add(newMh);
                }
            }            

            // Recalculate TotalHours/Cost on the UserWBSTask if it exists
            var userTask = taskEntity.UserWBSTasks.FirstOrDefault();
            if (userTask != null)
            {
                userTask.TotalHours = taskEntity.MonthlyHours.Sum(mh => mh.PlannedHours);
                userTask.TotalCost = (decimal)userTask.TotalHours * userTask.CostRate;
                userTask.UpdatedAt = DateTime.UtcNow;
                userTask.UpdatedBy = _currentUser;
            }
        }
    }
}

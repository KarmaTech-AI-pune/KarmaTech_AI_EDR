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
                .Include(t => t.PlannedHours)
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
            taskEntity.TodoProjectScheduleId = taskDto.TodoProjectScheduleId;
            UpdateUserAssignment(taskEntity, taskDto);
            UpdatePlannedHours(request.ProjectId, taskDto.TaskType,taskEntity, taskDto);
           
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
                        existingUserTask.TotalHours = taskDto.PlannedHours.Sum(ph => ph.PlannedHours);
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
                            TotalHours = taskEntity.PlannedHours.Sum(ph => ph.PlannedHours),
                            TotalCost = (decimal)taskEntity.PlannedHours.Sum(ph => ph.PlannedHours) * taskDto.CostRate,
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
                        existingUserTask.TotalHours = taskEntity.PlannedHours.Sum(ph => ph.PlannedHours);
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
                            TotalHours = taskEntity.PlannedHours.Sum(ph => ph.PlannedHours),
                            TotalCost = (decimal)taskEntity.PlannedHours.Sum(ph => ph.PlannedHours) * taskDto.CostRate,
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

        private WBSTaskPlannedHourHeader GetPlannedHourHeader(int projectId, TaskType taskType)
        {
            var header =  _context.Set<WBSTaskPlannedHourHeader>()
                   .FirstOrDefault(h => h.ProjectId == projectId && h.TaskType == taskType);

            return header!;
        }
        private void UpdatePlannedHours(int projectId, TaskType taskType,WBSTask taskEntity, WBSTaskDto taskDto)
        {

            var header =  GetPlannedHourHeader(projectId, taskType);

            var existingPlannedHours = taskEntity.PlannedHours.ToList();

            var existing = taskEntity.PlannedHours.ToDictionary(p => (p.Year, p.Month, p.WBSTaskPlannedHourHeaderId));

            foreach (var phDto in taskDto.PlannedHours)
            {
                var key = (phDto.Year.ToString(), phDto.Month, header.Id);
                if (existing.TryGetValue(key, out var existingPh))
                {
                    existingPh.PlannedHours = phDto.PlannedHours;
                    existingPh.UpdatedAt = DateTime.UtcNow;
                    existingPh.UpdatedBy = _currentUser;
                }
                else
                {
                    var newPh = new WBSTaskPlannedHour
                    {
                        WBSTask = taskEntity,
                        WBSTaskPlannedHourHeader = header,
                        WBSTaskPlannedHourHeaderId = header.Id,
                        Year = phDto.Year.ToString(),
                        Month = phDto.Month,
                        PlannedHours = phDto.PlannedHours,
                        CreatedAt = DateTime.UtcNow,
                        CreatedBy = _currentUser
                    };
                    taskEntity.PlannedHours.Add(newPh);
                    header.PlannedHours.Add(newPh);
                }
            }

            // Recalculate TotalHours/Cost on the UserWBSTask if it exists
            var userTask = taskEntity.UserWBSTasks.FirstOrDefault();
            if (userTask != null)
            {
                userTask.TotalHours = taskEntity.PlannedHours.Sum(ph => ph.PlannedHours);
                userTask.TotalCost = (decimal)userTask.TotalHours * userTask.CostRate;
                userTask.UpdatedAt = DateTime.UtcNow;
                userTask.UpdatedBy = _currentUser;
            }
        }
    }
}

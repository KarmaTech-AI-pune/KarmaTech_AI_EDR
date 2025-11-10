using MediatR;
using Microsoft.EntityFrameworkCore;
using NJS.Application.CQRS.WorkBreakdownStructures.Commands;
using NJS.Application.Dtos;
using NJS.Domain.Database;
using NJS.Domain.Entities;
using NJS.Domain.UnitWork;
using NJS.Repositories.Interfaces; // Add this for IWBSOptionRepository
using Microsoft.Extensions.Logging; // Add this for ILogger

namespace NJS.Application.CQRS.WorkBreakdownStructures.Handlers
{
    public class UpdateWBSTaskCommandHandler : IRequestHandler<UpdateWBSTaskCommand, Unit>
    {
        private readonly ProjectManagementContext _context;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IWBSOptionRepository _wbsOptionRepository; // Inject IWBSOptionRepository
        private readonly ILogger<UpdateWBSTaskCommandHandler> _logger; // Inject ILogger
        private readonly string _currentUser = "System";

        public UpdateWBSTaskCommandHandler(ProjectManagementContext context, IUnitOfWork unitOfWork, IWBSOptionRepository wbsOptionRepository, ILogger<UpdateWBSTaskCommandHandler> logger)
        {
            _context = context;
            _unitOfWork = unitOfWork;
            _wbsOptionRepository = wbsOptionRepository; // Assign repository
            _logger = logger; // Assign logger
        }

        public async Task<Unit> Handle(UpdateWBSTaskCommand request, CancellationToken cancellationToken)
        {
            _logger.LogInformation("Handling UpdateWBSTaskCommand for ProjectId {ProjectId}, TaskId {TaskId}, Payload {@Payload}",
                request.ProjectId, request.TaskId, request.TaskDto);

            var taskEntity = await _context.WBSTasks
                .Include(t => t.WorkBreakdownStructure)
                .Include(t => t.UserWBSTasks)
                .Include(t => t.PlannedHours)
                .FirstOrDefaultAsync(t => t.Id == request.TaskId && !t.IsDeleted, cancellationToken);

            if (taskEntity == null)
            {
                _logger.LogWarning("WBSTask with ID {TaskId} not found.", request.TaskId);
                throw new Exception($"WBSTask with ID {request.TaskId} not found.");
            }

            if (taskEntity.WorkBreakdownStructure == null || taskEntity.WorkBreakdownStructure.ProjectId != request.ProjectId)
            {
                _logger.LogError("Task {TaskId} does not belong to Project {ProjectId}.", request.TaskId, request.ProjectId);
                throw new Exception($"Task {request.TaskId} does not belong to Project {request.ProjectId}.");
            }

            var taskDto = request.TaskDto;
            
            // Directly assign WBSOptionId from DTO
            taskEntity.WBSOptionId = taskDto.WBSOptionId;
            taskEntity.Title = taskDto.Title; // Assign Title from DTO initially

            // If WBSOptionId is provided, override Title with the WBSOption's label
            if (taskDto.WBSOptionId.HasValue)
            {
                var wbsOption = await _wbsOptionRepository.GetByIdAsync(taskDto.WBSOptionId.Value);
                if (wbsOption != null)
                {
                    taskEntity.Title = wbsOption.Label; // Set entity Title to label for saving
                }
            }

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
            UpdatePlannedHours(request.ProjectId, taskDto.TaskType,taskEntity, taskDto);
           
            await _unitOfWork.SaveChangesAsync();
            _logger.LogInformation("WBSTask with ID {TaskId} updated successfully.", taskEntity.Id);

            // Populate WBSOptionLabel and Title in DTO for frontend display (using the saved entity's title)
            taskDto.Title = taskEntity.Title; // Use the title that was actually saved
            if (taskEntity.WBSOptionId.HasValue)
            {
                var wbsOption = await _wbsOptionRepository.GetByIdAsync(taskEntity.WBSOptionId.Value);
                if (wbsOption != null)
                {
                    taskDto.WBSOptionLabel = wbsOption.Label;
                }
                else
                {
                    taskDto.WBSOptionLabel = null;
                }
            }
            else
            {
                taskDto.WBSOptionLabel = null;
            }

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
                        existingUserTask.TotalHours = taskEntity.PlannedHours.Sum(ph => ph.PlannedHours);
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

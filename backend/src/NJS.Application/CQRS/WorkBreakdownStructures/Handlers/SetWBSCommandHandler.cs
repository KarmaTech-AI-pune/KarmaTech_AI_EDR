using MediatR;
using Microsoft.EntityFrameworkCore;
using NJS.Application.CQRS.WorkBreakdownStructures.Commands;
using NJS.Application.Dtos;
using NJS.Application.Services.IContract;
using NJS.Domain.Database;
using NJS.Domain.Entities;
using NJS.Domain.Enums;
using NJS.Domain.UnitWork;
using Microsoft.Extensions.Logging;

namespace NJS.Application.CQRS.WorkBreakdownStructures.Handlers
{
    public class SetWBSCommandHandler : IRequestHandler<SetWBSCommand, Unit>
    {
        private readonly ProjectManagementContext _context;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IProjectHistoryService _projectHistoryService;
        private readonly IUserContext _userContext;
        private readonly ILogger<SetWBSCommandHandler> _logger;
        private readonly string _currentUser = "System";

        public SetWBSCommandHandler(
            ProjectManagementContext context,
            IUnitOfWork unitOfWork,
            IProjectHistoryService projectHistoryService,
            IUserContext userContext,
            ILogger<SetWBSCommandHandler> logger)
        {
            _context = context;
            _unitOfWork = unitOfWork;
            _projectHistoryService = projectHistoryService;
            _userContext = userContext;
            _logger = logger;
        }

        public async Task<Unit> Handle(SetWBSCommand request, CancellationToken cancellationToken)
        {
            var wbs = await _context.WorkBreakdownStructures
                .Include(w => w.Tasks.Where(t => !t.IsDeleted))
                    .ThenInclude(t => t.UserWBSTasks)
                .Include(w => w.Tasks.Where(t => !t.IsDeleted))
                    .ThenInclude(t => t.PlannedHours)
                .FirstOrDefaultAsync(w => w.ProjectId == request.ProjectId, cancellationToken);

            if (wbs == null)
            {
                wbs = new WorkBreakdownStructure
                {
                    ProjectId = request.ProjectId,
                    IsActive = true,
                    Version = "1.0",
                    CreatedAt = DateTime.UtcNow,
                    CreatedBy = _currentUser,
                    Tasks = new List<WBSTask>()
                };
                _context.WorkBreakdownStructures.Add(wbs);
            }
            else
            {
                wbs.Version = CalculateNextVersion(wbs.Version);
            }

            var existingTasksDict = wbs.Tasks.ToDictionary(t => t.Id);
            var incomingTaskIds = request.Tasks.Where(t => t.Id > 0).Select(t => t.Id).ToHashSet();

            var tasksToDelete = wbs.Tasks.Where(t => !t.IsDeleted && !incomingTaskIds.Contains(t.Id)).ToList();
            foreach (var task in tasksToDelete)
            {
                task.IsDeleted = true;
                task.UpdatedAt = DateTime.UtcNow;
                task.UpdatedBy = _currentUser;
            }

            var tempIdToEntityMap = new Dictionary<string, WBSTask>();
            var pendingParentUpdates = new Dictionary<WBSTask, string>();
            var allTasks = new List<WBSTask>();

            foreach (var dto in request.Tasks)
            {
                WBSTask taskEntity = null!;
                if (dto.Id > 0 && existingTasksDict.TryGetValue(dto.Id, out taskEntity))
                {
                    taskEntity.Title = dto.Title;
                    taskEntity.Description = dto.Description;
                    taskEntity.Level = dto.Level;
                    taskEntity.ParentId = dto.ParentId;
                    taskEntity.DisplayOrder = dto.DisplayOrder;
                    taskEntity.EstimatedBudget = dto.EstimatedBudget;
                    taskEntity.StartDate = dto.StartDate;
                    taskEntity.EndDate = dto.EndDate;
                    taskEntity.TaskType = dto.TaskType;
                    taskEntity.UpdatedAt = DateTime.UtcNow;
                    taskEntity.UpdatedBy = _currentUser;
                    taskEntity.IsDeleted = false;

                    await UpdateUserAssignment(taskEntity, dto);
                    await UpdatePlannedHours(taskEntity, dto);
                }
                else
                {
                    taskEntity = new WBSTask
                    {
                        WorkBreakdownStructure = wbs,
                        Title = dto.Title,
                        Description = dto.Description,
                        Level = dto.Level,
                        DisplayOrder = dto.DisplayOrder,
                        EstimatedBudget = dto.EstimatedBudget,
                        StartDate = dto.StartDate,
                        EndDate = dto.EndDate,
                        TaskType = dto.TaskType,
                        CreatedAt = DateTime.UtcNow,
                        CreatedBy = _currentUser,
                        IsDeleted = false,
                        UserWBSTasks = new List<UserWBSTask>(),
                        PlannedHours = new List<WBSTaskPlannedHour>()

                    };

                    _context.WBSTasks.Add(taskEntity);
                    wbs.Tasks.Add(taskEntity);

                    await UpdateUserAssignment(taskEntity, dto);
                    await UpdatePlannedHours(taskEntity, dto);

                    if (!string.IsNullOrEmpty(dto.FrontendTempId))
                        tempIdToEntityMap[dto.FrontendTempId] = taskEntity;

                    if (!string.IsNullOrEmpty(dto.ParentFrontendTempId))
                    {
                        taskEntity.ParentId = null;
                        pendingParentUpdates[taskEntity] = dto.ParentFrontendTempId;
                    }
                    else if (dto.ParentId.HasValue)
                    {
                        taskEntity.ParentId = dto.ParentId;
                    }
                }

                allTasks.Add(taskEntity);
            }

            await _unitOfWork.SaveChangesAsync();

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
                await _unitOfWork.SaveChangesAsync();

            

            return Unit.Value;
        }

        private async Task UpdateUserAssignment(WBSTask task, WBSTaskDto dto)
        {
            var userTask = task.UserWBSTasks.FirstOrDefault();
            var totalHours = task.PlannedHours.Sum(mh => mh.PlannedHours);
            var totalCost = (decimal)totalHours * dto.CostRate;

            if (task.TaskType == TaskType.Manpower && !string.IsNullOrEmpty(dto.AssignedUserId))
            {
                if (userTask != null)
                {
                    userTask.UserId = dto.AssignedUserId;
                    userTask.Name = null;
                    userTask.CostRate = dto.CostRate;
                    userTask.Unit = dto.ResourceUnit;
                    userTask.TotalHours = totalHours;
                    userTask.TotalCost = totalCost;
                    userTask.UpdatedAt = DateTime.UtcNow;
                    userTask.UpdatedBy = _currentUser;
                    if (!string.IsNullOrEmpty(dto.ResourceRoleId) || (userTask.UserId != dto.AssignedUserId && userTask.Name != dto.ResourceName))
                    {
                        userTask.ResourceRoleId = dto.ResourceRoleId;
                    }
                }
                else
                {
                    task.UserWBSTasks.Add(new UserWBSTask
                    {
                        WBSTask = task,
                        UserId = dto.AssignedUserId,
                        Name = null,
                        CostRate = dto.CostRate,
                        Unit = dto.ResourceUnit,
                        TotalHours = totalHours,
                        TotalCost = totalCost,
                        CreatedAt = DateTime.UtcNow,
                        CreatedBy = _currentUser,
                        ResourceRoleId = dto.ResourceRoleId
                    });
                }
            }
            else if (task.TaskType == TaskType.ODC && !string.IsNullOrEmpty(dto.ResourceName))
            {
                if (userTask != null)
                {
                    userTask.UserId = null;
                    userTask.Name = dto.ResourceName;
                    userTask.CostRate = dto.CostRate;
                    userTask.Unit = dto.ResourceUnit;
                    userTask.TotalHours = totalHours;
                    userTask.TotalCost = totalCost;
                    userTask.UpdatedAt = DateTime.UtcNow;
                    userTask.UpdatedBy = _currentUser;
                    if (!string.IsNullOrEmpty(dto.ResourceRoleId) || (userTask.UserId != dto.AssignedUserId && userTask.Name != dto.ResourceName))
                    {
                        userTask.ResourceRoleId = dto.ResourceRoleId;
                    }
                }
                else
                {
                    task.UserWBSTasks.Add(new UserWBSTask
                    {
                        WBSTask = task,
                        UserId = null,
                        Name = dto.ResourceName,
                        CostRate = dto.CostRate,
                        Unit = dto.ResourceUnit,
                        TotalHours = totalHours,
                        TotalCost = totalCost,
                        CreatedAt = DateTime.UtcNow,
                        CreatedBy = _currentUser,
                        ResourceRoleId = dto.ResourceRoleId
                    });
                }
            }
            else if (userTask != null)
            {
                _context.UserWBSTasks.Remove(userTask);
            }
        }

        private async Task UpdatePlannedHours(WBSTask task, WBSTaskDto dto)
        {
            var header = await GetOrCreatePlannedHourHeader(task.WorkBreakdownStructure.ProjectId, task.TaskType);
            var existing = task.PlannedHours.ToDictionary(p => (p.Year, p.Month,p.WBSTaskPlannedHourHeaderId));

            foreach (var phDto in dto.PlannedHours)
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
                        WBSTask = task,
                        WBSTaskPlannedHourHeader = header,
                        WBSTaskPlannedHourHeaderId = header.Id,
                        Year = phDto.Year.ToString(),
                        Month = phDto.Month,
                        PlannedHours = phDto.PlannedHours,
                        CreatedAt = DateTime.UtcNow,
                        CreatedBy = _currentUser
                    };
                    task.PlannedHours.Add(newPh);
                    header.PlannedHours.Add(newPh);
                }
            }

            var userTask = task.UserWBSTasks.FirstOrDefault();
            if (userTask != null)
            {
                userTask.TotalHours = task.PlannedHours.Sum(m => m.PlannedHours);
                userTask.TotalCost = (decimal)userTask.TotalHours * userTask.CostRate;
            }
        }

        private async Task<WBSTaskPlannedHourHeader> GetOrCreatePlannedHourHeader(int projectId, TaskType taskType)
        {
            var header = await _context.Set<WBSTaskPlannedHourHeader>()
                .FirstOrDefaultAsync(h => h.ProjectId == projectId && h.TaskType == taskType);

            // Get project information regardless of whether header exists
            var project = await _context.Projects.AsNoTracking().FirstOrDefaultAsync(p => p.Id == projectId);
            if (project == null)
                throw new InvalidOperationException($"Project with ID {projectId} not found");
            var histories = new List<WBSHistory>();

            if (header == null)
            {
                
                // Add history entry for ODC task type
                if (project.ProjectManagerId is not null)
                {
                    histories.Add(new WBSHistory
                    {
                        StatusId = (int)PMWorkflowStatusEnum.Initial,
                        Action = "Initial",
                        Comments = "WBS ODC data has been updated",
                        ActionDate = DateTime.UtcNow,
                        ActionBy = _userContext.GetCurrentUserId(),
                        AssignedToId = project.ProjectManagerId ?? project.SeniorProjectManagerId ?? project.RegionalManagerId
                    });
                }
                if (project.SeniorProjectManagerId is not null)
                {
                    histories.Add(new WBSHistory
                    {
                        StatusId = (int)PMWorkflowStatusEnum.Initial,
                        Action = "Initial",
                        Comments = "WBS ODC data has been updated",
                        ActionDate = DateTime.UtcNow,
                        ActionBy = _userContext.GetCurrentUserId(),
                        AssignedToId = project.SeniorProjectManagerId
                    });
                }
                if (project.RegionalManagerId is not null)
                {
                    histories.Add(new WBSHistory
                    {
                        StatusId = (int)PMWorkflowStatusEnum.Initial,
                        Action = "Initial",
                        Comments = "WBS ODC data has been updated",
                        ActionDate = DateTime.UtcNow,
                        ActionBy = _userContext.GetCurrentUserId(),
                        AssignedToId = project.RegionalManagerId
                    });

                }
                header = new WBSTaskPlannedHourHeader
                {
                    ProjectId = projectId,
                    CreatedAt = DateTime.UtcNow,
                    CreatedBy = _currentUser,
                    PlannedHours = new HashSet<WBSTaskPlannedHour>(),
                    WBSHistories = new List<WBSHistory>(),
                    TaskType=taskType,
                };

                header.WBSHistories = histories;
                _context.Set<WBSTaskPlannedHourHeader>().Add(header);
                await _unitOfWork.SaveChangesAsync();
            }

            var temp = _context.WBSHistories.Where(x => x.WBSTaskPlannedHourHeaderId == header.Id);
            if (!temp.Any())
            {
                if (project.ProjectManagerId is not null)
                {
                    histories.Add(new WBSHistory
                    {
                        StatusId = (int)PMWorkflowStatusEnum.Initial,
                        Action = "Initial",
                        Comments = "WBS ODC data has been updated",
                        ActionDate = DateTime.UtcNow,
                        ActionBy = _userContext.GetCurrentUserId(),
                        AssignedToId = project.ProjectManagerId ,
                        WBSTaskPlannedHourHeaderId= header.Id
                    });
                }
                if (project.SeniorProjectManagerId is not null)
                {
                    histories.Add(new WBSHistory
                    {
                        StatusId = (int)PMWorkflowStatusEnum.Initial,
                        Action = "Initial",
                        Comments = "WBS ODC data has been updated",
                        ActionDate = DateTime.UtcNow,
                        ActionBy = _userContext.GetCurrentUserId(),
                        AssignedToId = project.SeniorProjectManagerId,
                        WBSTaskPlannedHourHeaderId = header.Id
                    });
                }
                if (project.RegionalManagerId is not null)
                {
                    histories.Add(new WBSHistory
                    {
                        StatusId = (int)PMWorkflowStatusEnum.Initial,
                        Action = "Initial",
                        Comments = "WBS ODC data has been updated",
                        ActionDate = DateTime.UtcNow,
                        ActionBy = _userContext.GetCurrentUserId(),
                        AssignedToId = project.RegionalManagerId,
                        WBSTaskPlannedHourHeaderId = header.Id
                    });

                }
                header.WBSHistories = histories;
                await _unitOfWork.SaveChangesAsync();
            }

            return header;
        }

        private string CalculateNextVersion(string currentVersion)
        {
            if (string.IsNullOrEmpty(currentVersion)) return "1.0";
            return decimal.TryParse(currentVersion, out var v)
                ? (v + 0.1m).ToString("F1")
                : currentVersion + "_updated";
        }
    }
}

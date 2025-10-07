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
using NJS.Repositories.Interfaces;
using System.Linq; // Ensure this is present for .FirstOrDefault()

namespace NJS.Application.CQRS.WorkBreakdownStructures.Handlers
{
    public class SetWBSCommandHandler : IRequestHandler<SetWBSCommand, Unit>
    {
        private readonly ProjectManagementContext _context;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IProjectHistoryService _projectHistoryService;
        private readonly IUserContext _userContext;
        private readonly ILogger<SetWBSCommandHandler> _logger;
        private readonly IWBSVersionRepository _wbsVersionRepository;
        private readonly IWBSOptionRepository _wbsOptionRepository; // Inject IWBSOptionRepository
        private readonly string _currentUser = "System";

        public SetWBSCommandHandler(
            ProjectManagementContext context,
            IUnitOfWork unitOfWork,
            IProjectHistoryService projectHistoryService,
            IUserContext userContext,
            ILogger<SetWBSCommandHandler> logger,
            IWBSVersionRepository wbsVersionRepository,
            IWBSOptionRepository wbsOptionRepository) // Add to constructor
        {
            _context = context;
            _unitOfWork = unitOfWork;
            _projectHistoryService = projectHistoryService;
            _userContext = userContext;
            _logger = logger;
            _wbsVersionRepository = wbsVersionRepository;
            _wbsOptionRepository = wbsOptionRepository; // Assign repository
        }

        public async Task<Unit> Handle(SetWBSCommand request, CancellationToken cancellationToken)
        {
            var tasksByType = request.Tasks.FirstOrDefault()!.TaskType;

            var wbsHeader = await _context.Set<WBSTaskPlannedHourHeader>().AsTracking()
                .FirstOrDefaultAsync(h => h.ProjectId == request.ProjectId && h.TaskType == tasksByType, cancellationToken);

            var wbs = await _context.WorkBreakdownStructures
                .Include(w => w.Tasks.Where(t => !t.IsDeleted))
                    .ThenInclude(t => t.UserWBSTasks)
                .Include(w => w.Tasks.Where(t => !t.IsDeleted))
                    .ThenInclude(t => t.PlannedHours)
                .AsSplitQuery()
                .FirstOrDefaultAsync(w => w.ProjectId == request.ProjectId && w.TaskType == tasksByType, cancellationToken);

            if (wbs == null)
            {
                wbs = new WorkBreakdownStructure
                {
                    ProjectId = request.ProjectId,
                    IsActive = true,
                    CurrentVersion = "1.0",
                    CreatedAt = DateTime.UtcNow,
                    TaskType = tasksByType,
                    CreatedBy = _userContext.GetCurrentUserId() ?? _currentUser,
                    Tasks = new List<WBSTask>()
                };

                _context.WorkBreakdownStructures.Add(wbs);
            }
            else
            { 
                var currentVersion = wbs.CurrentVersion;
                var tempVersion = wbsHeader is not null && wbsHeader.StatusId == (int)PMWorkflowStatusEnum.Approved
                    ? CalculateNextMajorVersion(currentVersion)
                    : CalculateNextVersion(currentVersion);
                wbs.CurrentVersion = tempVersion;
            }

            var existingTasksDict = wbs.Tasks.ToDictionary(t => t.Id);
            var incomingTaskIds = request.Tasks.Where(t => t.Id > 0).Select(t => t.Id).ToHashSet();

            var tasksToDelete = wbs.Tasks.Where(t => !t.IsDeleted && !incomingTaskIds.Contains(t.Id)).ToList();
            foreach (var task in tasksToDelete)
            {
                task.IsDeleted = true;
                task.UpdatedAt = DateTime.UtcNow;
                task.UpdatedBy = _userContext.GetCurrentUserId() ?? _currentUser;
            }

            var tempIdToEntityMap = new Dictionary<string, WBSTask>();
            var pendingParentUpdates = new Dictionary<WBSTask, string>();
            var allTasks = new List<WBSTask>();

            foreach (var dto in request.Tasks)
            {
                WBSTask taskEntity = null!;
                if (dto.Id > 0 && existingTasksDict.TryGetValue(dto.Id, out taskEntity))
                {
                    // Handle WBSOptionId from Title field for existing tasks
                    if (int.TryParse(dto.Title, out int wbsOptionId))
                    {
                        taskEntity.WBSOptionId = wbsOptionId; // Store the integer ID in WBSOptionId column
                        taskEntity.Title = dto.Title; // Store the original string (which is the ID) in Title column
                    }
                    else
                    {
                        taskEntity.WBSOptionId = null; // Clear WBSOptionId if title is not an ID
                        taskEntity.Title = dto.Title; // Store raw title if it's not a valid ID
                    }

                    taskEntity.Description = dto.Description;
                    taskEntity.Level = dto.Level;
                    taskEntity.ParentId = dto.ParentId;
                    taskEntity.DisplayOrder = dto.DisplayOrder;
                    taskEntity.EstimatedBudget = dto.EstimatedBudget;
                    taskEntity.StartDate = dto.StartDate;
                    taskEntity.EndDate = dto.EndDate;
                    taskEntity.TaskType = dto.TaskType;
                    taskEntity.UpdatedAt = DateTime.UtcNow;
                    taskEntity.UpdatedBy = _userContext.GetCurrentUserId() ?? _currentUser;
                    taskEntity.IsDeleted = false;

                    await UpdateUserAssignment(taskEntity, dto);
                    await UpdatePlannedHours(taskEntity, dto, wbs.CurrentVersion);
                }
                else
                {
                    // Handle WBSOptionId from Title field for new tasks
                    int? newWbsOptionId = null;
                    string newTitle = dto.Title;

                    if (int.TryParse(dto.Title, out int parsedWbsOptionId))
                    {
                        newWbsOptionId = parsedWbsOptionId;
                        newTitle = dto.Title; // Store the original string (which is the ID) in Title column
                    }
                    else
                    {
                        // newWbsOptionId remains null
                        // newTitle remains dto.Title
                    }

                    taskEntity = new WBSTask
                    {
                        WorkBreakdownStructure = wbs,
                        Title = newTitle, // Use the processed title
                        Description = dto.Description,
                        Level = dto.Level,
                        DisplayOrder = dto.DisplayOrder,
                        EstimatedBudget = dto.EstimatedBudget,
                        StartDate = dto.StartDate,
                        EndDate = dto.EndDate,
                        TaskType = dto.TaskType,
                        CreatedAt = DateTime.UtcNow,
                        CreatedBy = _userContext.GetCurrentUserId() ?? _currentUser,
                        IsDeleted = false,
                        UserWBSTasks = new List<UserWBSTask>(),
                        PlannedHours = new List<WBSTaskPlannedHour>(),
                        WBSOptionId = newWbsOptionId // Set the WBSOptionId
                    };

                    _context.WBSTasks.Add(taskEntity);
                    wbs.Tasks.Add(taskEntity);

                    await UpdateUserAssignment(taskEntity, dto);
                    await UpdatePlannedHours(taskEntity, dto, wbs.CurrentVersion);

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

            // After saving, update the DTOs with the actual WBSOptionLabel and Title for frontend display
            foreach (var dto in request.Tasks)
            {
                var correspondingEntity = allTasks.FirstOrDefault(t => t.Id == dto.Id || (!string.IsNullOrEmpty(dto.FrontendTempId) && tempIdToEntityMap.ContainsKey(dto.FrontendTempId) && tempIdToEntityMap[dto.FrontendTempId].Id == t.Id));
                if (correspondingEntity != null && correspondingEntity.WBSOptionId.HasValue)
                {
                    var wbsOption = await _wbsOptionRepository.GetByIdAsync(correspondingEntity.WBSOptionId.Value);
                    if (wbsOption != null)
                    {
                        dto.WBSOptionLabel = wbsOption.Label;
                        dto.Title = wbsOption.Label; // Set DTO Title to label for display
                    }
                    else
                    {
                        dto.WBSOptionLabel = null;
                        dto.Title = correspondingEntity.Title; // Fallback to stored ID if label not found
                    }
                }
                else if (correspondingEntity != null)
                {
                    dto.WBSOptionLabel = null;
                    dto.Title = correspondingEntity.Title; // Use stored title if no WBSOptionId
                }
            }

            // Create separate WBS versions for each TaskType
            await CreateWBSVersionAfterUpdate(wbs, request.Tasks);
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
                    userTask.UpdatedBy = _userContext.GetCurrentUserId() ?? _currentUser;
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
                        CreatedBy = _userContext.GetCurrentUserId() ?? _currentUser,
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
                    userTask.UpdatedBy = _userContext.GetCurrentUserId() ?? _currentUser;
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
                        CreatedBy = _userContext.GetCurrentUserId() ?? _currentUser,
                        ResourceRoleId = dto.ResourceRoleId
                    });
                }
            }
            else if (userTask != null)
            {
                _context.UserWBSTasks.Remove(userTask);
            }
        }

        private async Task UpdatePlannedHours(WBSTask task, WBSTaskDto dto, string wbsVersion = null!)
        {
            var header = await GetOrCreatePlannedHourHeader(task.WorkBreakdownStructure.ProjectId, task.TaskType, wbsVersion);
            var existing = task.PlannedHours.ToDictionary(p => (p.Year, p.Month, p.WBSTaskPlannedHourHeaderId));

            foreach (var phDto in dto.PlannedHours)
            {
                var yearStr = phDto.Year.ToString();
                var key = (yearStr, phDto.Month, header.Id);
                if (existing.TryGetValue(key, out var existingPh))
                {
                    existingPh.PlannedHours = phDto.PlannedHours;
                    existingPh.UpdatedAt = DateTime.UtcNow;
                    existingPh.UpdatedBy = _userContext.GetCurrentUserId() ?? _currentUser;
                }
                else
                {
                    var newPh = new WBSTaskPlannedHour
                    {
                        WBSTask = task,
                        WBSTaskPlannedHourHeaderId = header.Id,
                        Year = yearStr,
                        Month = phDto.Month,
                        PlannedHours = phDto.PlannedHours,
                        CreatedAt = DateTime.UtcNow,
                        CreatedBy = _userContext.GetCurrentUserId() ?? _currentUser
                    };
                    task.PlannedHours.Add(newPh);
                }
            }

            var userTask = task.UserWBSTasks.FirstOrDefault();
            if (userTask != null)
            {
                userTask.TotalHours = task.PlannedHours.Sum(m => m.PlannedHours);
                userTask.TotalCost = (decimal)userTask.TotalHours * userTask.CostRate;
            }
        }

        private async Task<WBSTaskPlannedHourHeader> GetOrCreatePlannedHourHeaderOld(int projectId, TaskType taskType, string version = null!)
        {
            var header = await _context.Set<WBSTaskPlannedHourHeader>()
                .FirstOrDefaultAsync(h => h.ProjectId == projectId && h.TaskType == taskType);

            // Get project information regardless of whether header exists
            var project = await _context.Projects.AsNoTracking().FirstOrDefaultAsync(p => p.Id == projectId);
            if (project == null)
                throw new InvalidOperationException($"Project with ID {projectId} not found");

            if (header == null)
            {
                var histories = new List<WBSHistory>();

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
                    CreatedBy = _userContext.GetCurrentUserId() ?? _currentUser,
                    TaskType = taskType,
                    Version = version ?? "1.0",
                };

                _context.Set<WBSTaskPlannedHourHeader>().Add(header);
                await _unitOfWork.SaveChangesAsync();

                // Add histories after header is saved and has an ID
                foreach (var history in histories)
                {
                    history.WBSTaskPlannedHourHeaderId = header.Id;
                    _context.WBSHistories.Add(history);
                }
                await _unitOfWork.SaveChangesAsync();
            }

            else
            {
                if (header != null)
                {
                    header.Version = version;
                    _context.Set<WBSTaskPlannedHourHeader>().Update(header);
                    await _unitOfWork.SaveChangesAsync();
                }
                if (header!.StatusId == (int)PMWorkflowStatusEnum.Approved)
                {

                    var histories = new List<WBSHistory>();
                    if (project.ProjectManagerId is not null)
                    {
                        histories.Add(new WBSHistory
                        {
                            StatusId = (int)PMWorkflowStatusEnum.Initial,
                            Action = "Initial",
                            Comments = "WBS ODC data has been updated",
                            ActionDate = DateTime.UtcNow,
                            ActionBy = _userContext.GetCurrentUserId(),
                            AssignedToId = project.ProjectManagerId,
                            WBSTaskPlannedHourHeaderId = header.Id
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
            }

           

            return header!;
        }

        private string CalculateNextVersion(string currentVersion)
        {
            if (string.IsNullOrEmpty(currentVersion)) return "1.0";
            if (decimal.TryParse(currentVersion, out var v))
            {
                var nextVersion = v + 0.1m;
                return nextVersion.ToString("F1");
            }
            else
            {
                // Handle non-numeric versions (e.g., "1.0_updated")
                // For simplicity, just append "_updated" again
                return currentVersion + "_updated";
            }
        }


        private string CalculateNextMajorVersion(string currentVersion)
        {
            if (string.IsNullOrEmpty(currentVersion)) return "1.0";
            if (decimal.TryParse(currentVersion, out var v))
            {
                var nextVersion = Math.Floor(v) + 1;
                return nextVersion.ToString("F1");
            }
            else
            {
                // Handle non-numeric versions (e.g., "1.0_updated")
                // For simplicity, just append "_updated" again
                return currentVersion + "_updated";
            }
        }

        private async Task CreateWBSVersionAfterUpdate(WorkBreakdownStructure wbs, List<WBSTaskDto> tasks)
        {
            try
            {
                var nextVersionForEdit = wbs.CurrentVersion;
                // Generate next version number
                var nextVersion = await _wbsVersionRepository.GetNextVersionNumberAsync(wbs.ProjectId);


                
                // Create new WBS version
                var wbsVersion = new WBSVersionHistory
                {
                    WorkBreakdownStructureId = wbs.Id,
                    Version = nextVersionForEdit,
                    Comments = $"Auto-generated version after WBS update - {DateTime.UtcNow:yyyy-MM-dd HH:mm:ss}",
                    CreatedBy = _userContext.GetCurrentUserId() ?? _currentUser,
                    StatusId = (int)PMWorkflowStatusEnum.Initial,
                    IsLatest = true,
                    IsActive = false

                };

                // Deactivate all previous versions
                var existingVersions = await _wbsVersionRepository.GetByProjectIdAsync(wbs.ProjectId);
                foreach (var version in existingVersions.Where(v => v.IsLatest))
                {
                    version.IsLatest = false;
                    await _wbsVersionRepository.UpdateVersionAsync(version);
                }

                // Save the new version
                await _wbsVersionRepository.CreateVersionAsync(wbsVersion);

                await CopyTasksToVersion(wbs.Tasks.Where(t => !t.IsDeleted).ToList(), wbsVersion.Id);

                wbs.LatestVersionHistoryId = wbsVersion.Id;
                wbs.CurrentVersion = nextVersionForEdit;
                _context.Entry(wbs).State = EntityState.Modified;
                await _context.SaveChangesAsync();

                _logger.LogInformation($"Created WBS version {nextVersion} for project {wbs.ProjectId} after update");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error creating WBS version for project {wbs.ProjectId}");
            }
        }

        private async Task CopyTasksToVersion(List<WBSTask> tasks, int wbsVersionHistoryId)
        {
            var taskMap = new Dictionary<int, int>();

            foreach (var task in tasks.OrderBy(t => t.DisplayOrder))
            {
                var taskVersion = new WBSTaskVersionHistory
                {
                    WBSVersionHistoryId = wbsVersionHistoryId,
                    OriginalTaskId = task.Id,
                    ParentId = null,
                    Level = task.Level,
                    Title = task.Title,
                    Description = task.Description,
                    DisplayOrder = task.DisplayOrder,
                    EstimatedBudget = task.EstimatedBudget,
                    StartDate = task.StartDate,
                    EndDate = task.EndDate,
                    TaskType = task.TaskType
                };

                await _wbsVersionRepository.CreateTaskVersionAsync(taskVersion);
                taskMap[task.Id] = taskVersion.Id;
            }

            // Second pass: Update parent relationships
            foreach (var task in tasks)
            {
                if (task.ParentId.HasValue && taskMap.ContainsKey(task.ParentId.Value))
                {
                    var taskVersion = await _wbsVersionRepository.GetTaskVersionByIdAsync(taskMap[task.Id]);
                    taskVersion.ParentId = taskMap[task.ParentId.Value];
                    await _wbsVersionRepository.UpdateTaskVersionAsync(taskVersion);
                }
            }

            // Copy planned hours and user assignments
            foreach (var task in tasks)
            {
                var taskVersion = await _wbsVersionRepository.GetTaskVersionByIdAsync(taskMap[task.Id]);

                // Copy planned hours
                foreach (var plannedHour in task.PlannedHours)
                {
                    var plannedHourVersion = new WBSTaskPlannedHourVersionHistory
                    {
                        WBSTaskVersionHistoryId = taskVersion.Id,
                        Year = plannedHour.Year,
                        Month = plannedHour.Month,
                        PlannedHours = plannedHour.PlannedHours,
                        CreatedBy = _userContext.GetCurrentUserId() ?? _currentUser
                    };
                    await _wbsVersionRepository.CreatePlannedHourVersionAsync(plannedHourVersion);
                }

                // Copy user assignments
                foreach (var userAssignment in task.UserWBSTasks)
                {
                    var userAssignmentVersion = new UserWBSTaskVersionHistory
                    {
                        WBSTaskVersionHistoryId = taskVersion.Id,
                        UserId = userAssignment.UserId,
                        ResourceRoleId = userAssignment.ResourceRoleId
                    };
                    await _wbsVersionRepository.CreateUserAssignmentVersionAsync(userAssignmentVersion);
                }
            }
        }

        private async Task<WBSTaskPlannedHourHeader> GetOrCreatePlannedHourHeader(int projectId, TaskType taskType, string version = null!)
        {
            var header = await _context.Set<WBSTaskPlannedHourHeader>()
                .FirstOrDefaultAsync(h => h.ProjectId == projectId && h.TaskType == taskType);

            if (header == null)
            {
                return await CreateNewHeaderWithHistories(projectId, taskType, version, await _context.Projects.AsNoTracking().FirstOrDefaultAsync(p => p.Id == projectId));
            }

            header.Version = version ?? "1.0";
            _context.Set<WBSTaskPlannedHourHeader>().Update(header);
            await _unitOfWork.SaveChangesAsync();

            await ResetOrAddHistoryEntriesToHeader(header, await _context.Projects.AsNoTracking().FirstOrDefaultAsync(p => p.Id == projectId));

            return header;
        }
        private async Task<WBSTaskPlannedHourHeader> CreateNewHeaderWithHistories(int projectId, TaskType taskType, string version, Project project)
        {
            var header = new WBSTaskPlannedHourHeader
            {
                ProjectId = projectId,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = _userContext.GetCurrentUserId() ?? _currentUser,
                TaskType = taskType,
                Version = version ?? "1.0"
            };

            _context.Set<WBSTaskPlannedHourHeader>().Add(header);
            await _unitOfWork.SaveChangesAsync();

            var histories = BuildInitialHistoryEntries(project, header.Id);
            _context.WBSHistories.AddRange(histories);
            await _unitOfWork.SaveChangesAsync();

            return header;
        }
        private async Task ResetOrAddHistoryEntriesToHeader(WBSTaskPlannedHourHeader header, Project project)
        {
            var headerId = header.Id;
            var latestApprovedExists = await _context.WBSHistories
                .Where(h => h.WBSTaskPlannedHourHeaderId == headerId && !h.IsDeleted)
                .OrderByDescending(h => h.ActionDate)
                .AnyAsync(h => h.StatusId == (int)PMWorkflowStatusEnum.Approved);

            var shouldSoftDeleteExisting = header.StatusId == (int)PMWorkflowStatusEnum.Approved || latestApprovedExists;

            if (shouldSoftDeleteExisting)
            {
                var existingHistories = await _context.WBSHistories
                    .Where(h => h.WBSTaskPlannedHourHeaderId == headerId && !h.IsDeleted)
                    .ToListAsync();

                foreach (var h in existingHistories)
                    h.IsDeleted = true;

                _context.WBSHistories.UpdateRange(existingHistories);


                var histories = BuildInitialHistoryEntries(project, header.Id, false);
                _context.WBSHistories.AddRange(histories);

                header.StatusId = (int)PMWorkflowStatusEnum.Initial;
                _context.Set<WBSTaskPlannedHourHeader>().Update(header);


                await _unitOfWork.SaveChangesAsync();
            }
        }


        private List<WBSHistory> BuildInitialHistoryEntries(Project project, int headerId, bool isSoftDelete = false)
        {
            var userId = _userContext.GetCurrentUserId();
            var actionDate = DateTime.UtcNow;
            var histories = new List<WBSHistory>();

            void AddHistory(string assignedToId)
            {
                if (assignedToId is not null)
                {
                    histories.Add(new WBSHistory
                    {
                        StatusId = (int)PMWorkflowStatusEnum.Initial,
                        Action = "Initial",
                        Comments = "WBS ODC data has been updated",
                        ActionDate = actionDate,
                        ActionBy = userId,
                        AssignedToId = assignedToId,
                        WBSTaskPlannedHourHeaderId = headerId,
                        IsDeleted = isSoftDelete
                    });
                }
            }

            AddHistory(project.ProjectManagerId);
            AddHistory(project.SeniorProjectManagerId);
            AddHistory(project.RegionalManagerId);

            return histories;
        }

    }
}

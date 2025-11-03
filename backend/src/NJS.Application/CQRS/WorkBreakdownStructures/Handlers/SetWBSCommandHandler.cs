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
using System.Linq;
using System.Collections.Generic;
using System;

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
        private readonly IWBSOptionRepository _wbsOptionRepository;
        private readonly string _currentUser = "System";

        public SetWBSCommandHandler(
            ProjectManagementContext context,
            IUnitOfWork unitOfWork,
            IProjectHistoryService projectHistoryService,
            IUserContext userContext,
            ILogger<SetWBSCommandHandler> logger,
            IWBSVersionRepository wbsVersionRepository,
            IWBSOptionRepository wbsOptionRepository)
        {
            _context = context;
            _unitOfWork = unitOfWork;
            _projectHistoryService = projectHistoryService;
            _userContext = userContext;
            _logger = logger;
            _wbsVersionRepository = wbsVersionRepository;
            _wbsOptionRepository = wbsOptionRepository;
        }

        public async Task<Unit> Handle(SetWBSCommand request, CancellationToken cancellationToken)
        {
            // 1. Handle WBSHeader creation/update based on WBSMaster.WbsHeaderId
            WBSHeader wbsHeader;

            if (request.WBSMaster.WbsHeaderId > 0)
            {
                // Load existing WBSHeader
                wbsHeader = await _context.WBSHeaders
                    .Include(h => h.WorkBreakdownStructures) // Include all WorkBreakdownStructures
                        .ThenInclude(wbs => wbs.Tasks.Where(t => !t.IsDeleted)) // Only include non-deleted tasks
                            .ThenInclude(t => t.UserWBSTasks)
                    .Include(h => h.WorkBreakdownStructures) // Include all WorkBreakdownStructures
                        .ThenInclude(wbs => wbs.Tasks.Where(t => !t.IsDeleted)) // Only include non-deleted tasks
                            .ThenInclude(t => t.PlannedHours)
                    .Include(h => h.VersionHistories)
                    .AsSplitQuery()
                    .FirstOrDefaultAsync(h => h.Id == request.WBSMaster.WbsHeaderId && h.ProjectId == request.ProjectId, cancellationToken);

                if (wbsHeader == null)
                {
                    throw new ArgumentException($"WBSHeader with ID {request.WBSMaster.WbsHeaderId} not found for project {request.ProjectId}.");
                }

                // Update existing header
                wbsHeader.VersionDate = DateTime.UtcNow;
                wbsHeader.CreatedBy = _userContext.GetCurrentUserId() ?? _currentUser;
                _context.WBSHeaders.Update(wbsHeader);
            }
            else
            {
                // Create new WBSHeader
                wbsHeader = new WBSHeader
                {
                    ProjectId = request.ProjectId,
                    Version = "1.0",
                    VersionDate = DateTime.UtcNow,
                    CreatedBy = _userContext.GetCurrentUserId() ?? _currentUser,
                    IsActive = true,
                    ApprovalStatus = PMWorkflowStatusEnum.Initial,
                    WorkBreakdownStructures = new List<WorkBreakdownStructure>(),
                    VersionHistories = new List<WBSVersionHistory>()
                };
                _context.WBSHeaders.Add(wbsHeader);
                await _unitOfWork.SaveChangesAsync(); // Save to get ID
            }

            // 2. Handle WorkBreakdownStructures (WBS Groups)
            var existingWBSGroupsDict = wbsHeader.WorkBreakdownStructures.ToDictionary(w => w.Id);
            var incomingWBSGroupIds = request.WBSMaster.WorkBreakdownStructures
                .Where(dto => dto.WorkBreakdownStructureId > 0)
                .Select(dto => dto.WorkBreakdownStructureId)
                .ToHashSet();

            foreach (var wbsGroupDto in request.WBSMaster.WorkBreakdownStructures)
            {
                WorkBreakdownStructure wbsGroupEntity;
                if (wbsGroupDto.WorkBreakdownStructureId > 0 && existingWBSGroupsDict.TryGetValue(wbsGroupDto.WorkBreakdownStructureId, out wbsGroupEntity))
                {
                    // Update existing WBS Group
                    wbsGroupEntity.Name = wbsGroupDto.Name;
                    wbsGroupEntity.Description = wbsGroupDto.Description;
                    wbsGroupEntity.DisplayOrder = wbsGroupDto.DisplayOrder;
                    // Removed UpdatedAt and UpdatedBy as WorkBreakdownStructure no longer has these properties
                    _context.WorkBreakdownStructures.Update(wbsGroupEntity);
                }
                else
                {
                    // Create new WBS Group
                    wbsGroupEntity = new WorkBreakdownStructure
                    {
                        WBSHeader = wbsHeader,
                        Name = wbsGroupDto.Name,
                        Description = wbsGroupDto.Description,
                        DisplayOrder = wbsGroupDto.DisplayOrder,
                        CreatedAt = DateTime.UtcNow,
                        CreatedBy = _userContext.GetCurrentUserId() ?? _currentUser,
                        Tasks = new List<WBSTask>()
                    };
                    _context.WorkBreakdownStructures.Add(wbsGroupEntity);
                    wbsHeader.WorkBreakdownStructures.Add(wbsGroupEntity);
                }

                // 3. Handle WBSTasks within each WBS Group recursively
                var tempIdToEntityMap = new Dictionary<string, WBSTask>();
                var pendingParentUpdates = new Dictionary<WBSTask, string>();
                var allTasks = new List<WBSTask>();

                // Process tasks and their children recursively
                await ProcessTasksRecursively(wbsGroupDto.Tasks, wbsGroupEntity, null, null, tempIdToEntityMap, pendingParentUpdates, allTasks, wbsHeader);

                await _unitOfWork.SaveChangesAsync();

                // Resolve parent-child relationships for newly created tasks using temp IDs
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

                // Update DTOs with final values after saving (e.g., WBSOptionLabel)
                foreach (var dto in wbsGroupDto.Tasks)
                {
                    var correspondingEntity = allTasks.FirstOrDefault(t => t.Id == dto.Id || (!string.IsNullOrEmpty(dto.FrontendTempId) && tempIdToEntityMap.ContainsKey(dto.FrontendTempId) && tempIdToEntityMap[dto.FrontendTempId].Id == t.Id));
                    if (correspondingEntity != null)
                    {
                        dto.Title = correspondingEntity.Title;
                        // Update WBSOptionLabel
                        if (correspondingEntity.WBSOptionId.HasValue)
                        {
                            var wbsOption = await _wbsOptionRepository.GetByIdAsync(correspondingEntity.WBSOptionId.Value);
                            if (wbsOption != null)
                            {
                                dto.WBSOptionLabel = wbsOption.Label;
                            }
                            else
                            {
                                dto.WBSOptionLabel = null;
                            }
                        }
                        else
                        {
                            dto.WBSOptionLabel = null;
                        }
                    }
                }
            }

            // 4. Create WBSVersionHistory and link granular versions
            await CreateWBSVersionAfterUpdate(wbsHeader);

            return Unit.Value;
        }

        /// <summary>
        /// Processes a flat list of WBSTaskDto, handling creation, updates, and parent-child relationships.
        /// Parent-child relationships are managed through ParentId and ParentFrontendTempId properties.
        /// </summary>
        private async Task ProcessTasksRecursively(
            ICollection<WBSTaskDto> taskDtos,
            WorkBreakdownStructure wbsGroupEntity,
            int? parentId, // This parameter is not directly used for setting ParentId in this recursive call, but is conceptually the parent's ID.
            string? parentFrontendTempId, // This is used to link children to their parent's temp ID.
            Dictionary<string, WBSTask> tempIdToEntityMap,
            Dictionary<WBSTask, string> pendingParentUpdates,
            List<WBSTask> allTasks,
            WBSHeader wbsHeader)
        {
            var existingTasksDict = wbsGroupEntity.Tasks.ToDictionary(t => t.Id);
            var incomingTaskIds = taskDtos.Where(t => t.Id > 0).Select(t => t.Id).ToHashSet();

            // Mark tasks for deletion if they exist in DB but not in incoming DTOs
            var tasksToDelete = wbsGroupEntity.Tasks.Where(t => !t.IsDeleted && !incomingTaskIds.Contains(t.Id)).ToList();
            foreach (var task in tasksToDelete)
            {
                task.IsDeleted = true;
                task.UpdatedAt = DateTime.UtcNow;
                task.UpdatedBy = _userContext.GetCurrentUserId() ?? _currentUser;
            }

            foreach (var dto in taskDtos)
            {
                WBSTask taskEntity;
                bool isNewTask = dto.Id <= 0; // Assuming 0 or negative means new

                if (!isNewTask && existingTasksDict.TryGetValue(dto.Id, out taskEntity))
                {
                    // Update existing task
                    taskEntity.WBSOptionId = dto.WBSOptionId;
                    taskEntity.Title = dto.Title;
                    taskEntity.Description = dto.Description;
                    taskEntity.Level = dto.Level;
                    taskEntity.DisplayOrder = dto.DisplayOrder;
                    taskEntity.EstimatedBudget = dto.EstimatedBudget;
                    taskEntity.StartDate = dto.StartDate;
                    taskEntity.EndDate = dto.EndDate;
                    taskEntity.TaskType = dto.TaskType;
                    taskEntity.UpdatedAt = DateTime.UtcNow;
                    taskEntity.UpdatedBy = _userContext.GetCurrentUserId() ?? _currentUser;
                    taskEntity.IsDeleted = false; // Ensure it's not marked as deleted

                    // Handle WBS Option Label
                    if (dto.WBSOptionId.HasValue)
                    {
                        var wbsOption = await _wbsOptionRepository.GetByIdAsync(dto.WBSOptionId.Value);
                        if (wbsOption != null)
                        {
                            taskEntity.Title = wbsOption.Label; // Overwrite title if WBS Option has a label
                        }
                    }

                    // Set ParentId based on DTO's ParentId or ParentFrontendTempId
                    if (!string.IsNullOrEmpty(dto.ParentFrontendTempId))
                    {
                        taskEntity.ParentId = null; // Clear existing ParentId if using temp ID
                        pendingParentUpdates[taskEntity] = dto.ParentFrontendTempId;
                    }
                    else
                    {
                        taskEntity.ParentId = dto.ParentId; // Use DTO's ParentId if available
                    }

                    await UpdateUserAssignment(taskEntity, dto);
                    await UpdatePlannedHours(taskEntity, dto, wbsHeader.Version, wbsHeader.ProjectId);
                }
                else
                {
                    // Create new task
                    taskEntity = new WBSTask
                    {
                        WorkBreakdownStructure = wbsGroupEntity,
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
                        WBSOptionId = dto.WBSOptionId,
                        Title = dto.Title
                    };

                    // Handle WBS Option Label
                    if (dto.WBSOptionId.HasValue)
                    {
                        var wbsOption = await _wbsOptionRepository.GetByIdAsync(dto.WBSOptionId.Value);
                        if (wbsOption != null)
                        {
                            taskEntity.Title = wbsOption.Label; // Overwrite title if WBS Option has a label
                        }
                    }

                    // Set ParentId based on DTO's ParentId or ParentFrontendTempId
                    if (!string.IsNullOrEmpty(dto.ParentFrontendTempId))
                    {
                        taskEntity.ParentId = null; // Clear existing ParentId if using temp ID
                        pendingParentUpdates[taskEntity] = dto.ParentFrontendTempId;
                    }
                    else
                    {
                        taskEntity.ParentId = dto.ParentId; // Use DTO's ParentId if available
                    }

                    _context.WBSTasks.Add(taskEntity);
                    wbsGroupEntity.Tasks.Add(taskEntity);

                    await UpdateUserAssignment(taskEntity, dto);
                    await UpdatePlannedHours(taskEntity, dto, wbsHeader.Version, wbsHeader.ProjectId);

                    // Map temporary IDs for resolving parent-child relationships later
                    if (!string.IsNullOrEmpty(dto.FrontendTempId))
                        tempIdToEntityMap[dto.FrontendTempId] = taskEntity;
                }

                allTasks.Add(taskEntity);
            }
        }

        private async Task CreateWBSVersionAfterUpdate(WBSHeader wbsHeader)
        {
            try
            {
                var nextVersionForEdit = wbsHeader.Version;

                var wbsVersionHistory = new WBSVersionHistory
                {
                    WBSHeaderId = wbsHeader.Id,
                    Version = nextVersionForEdit,
                    Comments = $"Auto-generated version after WBS update - {DateTime.UtcNow:yyyy-MM-dd HH:mm:ss}",
                    CreatedBy = _userContext.GetCurrentUserId() ?? _currentUser,
                    StatusId = (int)PMWorkflowStatusEnum.Initial,
                    IsLatest = true,
                    IsActive = false
                };

                var existingVersions = await _context.WBSVersionHistories
                    .Where(v => v.WBSHeaderId == wbsHeader.Id && v.IsLatest)
                    .ToListAsync();
                foreach (var version in existingVersions)
                {
                    version.IsLatest = false;
                    _context.WBSVersionHistories.Update(version);
                }

                _context.WBSVersionHistories.Add(wbsVersionHistory);
                await _unitOfWork.SaveChangesAsync();

                wbsHeader.LatestVersionHistoryId = wbsVersionHistory.Id;
                _context.WBSHeaders.Update(wbsHeader);
                await _unitOfWork.SaveChangesAsync();

                foreach (var wbsGroup in wbsHeader.WorkBreakdownStructures)
                {
                    await CopyTasksToVersion(wbsGroup.Tasks.Where(t => !t.IsDeleted).ToList(), wbsVersionHistory.Id);
                }

                _logger.LogInformation($"Created WBS version history {nextVersionForEdit} for WBSHeader {wbsHeader.Id} after update");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error creating WBS version history for WBSHeader {wbsHeader.Id}");
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

            foreach (var task in tasks)
            {
                if (task.ParentId.HasValue && taskMap.ContainsKey(task.ParentId.Value))
                {
                    var taskVersion = await _wbsVersionRepository.GetTaskVersionByIdAsync(taskMap[task.Id]);
                    taskVersion.ParentId = taskMap[task.ParentId.Value];
                    await _wbsVersionRepository.UpdateTaskVersionAsync(taskVersion);
                }
            }

            foreach (var task in tasks)
            {
                var taskVersion = await _wbsVersionRepository.GetTaskVersionByIdAsync(taskMap[task.Id]);

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

        private async Task UpdateUserAssignment(WBSTask task, WBSTaskDto dto)
        {
            var userTask = task.UserWBSTasks.FirstOrDefault();
            var totalHours = task.PlannedHours.Sum(mh => mh.PlannedHours);
            var totalCost = (decimal)totalHours * dto.CostRate;

            if (task.TaskType == TaskType.Manpower)
            {
                bool shouldHaveUserWBSTask = task.Level == WBSTaskLevel.Level3 ||
                                              (!string.IsNullOrEmpty(dto.AssignedUserId) && dto.AssignedUserId != "string");

                if (shouldHaveUserWBSTask)
                {
                    string? actualUserId = (string.IsNullOrEmpty(dto.AssignedUserId) || dto.AssignedUserId == "string") ? null : dto.AssignedUserId;
                    string? actualResourceRoleId = (string.IsNullOrEmpty(dto.ResourceRoleId) || dto.ResourceRoleId == "string") ? null : dto.ResourceRoleId;

                    if (!string.IsNullOrEmpty(actualUserId))
                    {
                        var userExists = await _context.Users.AnyAsync(u => u.Id == actualUserId);
                        if (!userExists)
                        {
                            throw new Exception($"Assigned User with ID '{actualUserId}' not found. Cannot assign task.");
                        }
                    }

                    if (userTask != null)
                    {
                        userTask.UserId = actualUserId;
                        userTask.Name = null;
                        userTask.CostRate = dto.CostRate;
                        userTask.Unit = dto.ResourceUnit;
                        userTask.TotalHours = totalHours;
                        userTask.TotalCost = totalCost;
                        userTask.UpdatedAt = DateTime.UtcNow;
                        userTask.UpdatedBy = _userContext.GetCurrentUserId() ?? _currentUser;
                        userTask.ResourceRoleId = actualResourceRoleId;
                    }
                    else
                    {
                        task.UserWBSTasks.Add(new UserWBSTask
                        {
                            WBSTask = task,
                            UserId = actualUserId,
                            Name = null,
                            CostRate = dto.CostRate,
                            Unit = dto.ResourceUnit,
                            TotalHours = totalHours,
                            TotalCost = totalCost,
                            CreatedAt = DateTime.UtcNow,
                            CreatedBy = _userContext.GetCurrentUserId() ?? _currentUser,
                            ResourceRoleId = actualResourceRoleId
                        });
                    }
                }
                else if (userTask != null)
                {
                    _context.UserWBSTasks.Remove(userTask);
                }
            }
            else if (task.TaskType == TaskType.ODC)
            {
                bool shouldHaveUserWBSTask = !string.IsNullOrEmpty(dto.ResourceName);

                if (shouldHaveUserWBSTask)
                {
                    string? actualResourceRoleId = (string.IsNullOrEmpty(dto.ResourceRoleId) || dto.ResourceRoleId == "string") ? null : dto.ResourceRoleId;

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
                        userTask.ResourceRoleId = actualResourceRoleId;
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
                            ResourceRoleId = actualResourceRoleId
                        });
                    }
                }
                else if (userTask != null)
                {
                    _context.UserWBSTasks.Remove(userTask);
                }
            }
            else if (userTask != null)
            {
                _context.UserWBSTasks.Remove(userTask);
            }
        }

        private async Task UpdatePlannedHours(WBSTask task, WBSTaskDto dto, string wbsVersion, int projectId)
        {
            var header = await GetOrCreatePlannedHourHeader(projectId, task.TaskType, wbsVersion);
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

using MediatR;
using Microsoft.EntityFrameworkCore;
using EDR.Application.CQRS.WorkBreakdownStructures.Commands;
using EDR.Application.Dtos;
using EDR.Application.Services.IContract;
using EDR.Domain.Database;
using EDR.Domain.Entities;
using EDR.Domain.Enums;
using EDR.Domain.UnitWork;
using Microsoft.Extensions.Logging;
using EDR.Repositories.Interfaces;
using System.Linq;
using System.Collections.Generic;
using System;

namespace EDR.Application.CQRS.WorkBreakdownStructures.Handlers
{
    public class SetWBSCommandHandler : IRequestHandler<SetWBSCommand, WBSMasterDto>
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

        public async Task<WBSMasterDto> Handle(SetWBSCommand request, CancellationToken cancellationToken)
        {
            _logger.LogInformation("SetWBSCommandHandler: Processing WBS for ProjectId {ProjectId}, WbsHeaderId {WbsHeaderId}, TenantId {TenantId}",
                request.ProjectId, request.WBSMaster.WbsHeaderId, _context.TenantId);

            // 1. Handle WBSHeader creation/update based on WBSMaster.WbsHeaderId
            WBSHeader wbsHeader;

            if (request.WBSMaster.WbsHeaderId > 0)
            {
                _logger.LogInformation("SetWBSCommandHandler: Loading existing WBSHeader with ID {WbsHeaderId}", request.WBSMaster.WbsHeaderId);

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
                    _logger.LogError("SetWBSCommandHandler: WBSHeader with ID {WbsHeaderId} not found for project {ProjectId}",
                        request.WBSMaster.WbsHeaderId, request.ProjectId);
                    throw new ArgumentException($"WBSHeader with ID {request.WBSMaster.WbsHeaderId} not found for project {request.ProjectId}.");
                }

                _logger.LogInformation("SetWBSCommandHandler: Found existing WBSHeader with {Count} WBS groups",
                    wbsHeader.WorkBreakdownStructures.Count);

                // Update existing header
                wbsHeader.VersionDate = DateTime.UtcNow;
                wbsHeader.CreatedBy = _userContext.GetCurrentUserId() ?? _currentUser;
                _context.WBSHeaders.Update(wbsHeader);
            }
            else
            {
                _logger.LogInformation("SetWBSCommandHandler: Creating new WBSHeader for ProjectId {ProjectId}", request.ProjectId);

                // Create new WBSHeader
                wbsHeader = new WBSHeader
                {
                    TenantId = _context.TenantId ?? 0, // Set TenantId from context
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

                _logger.LogInformation("SetWBSCommandHandler: Created new WBSHeader with ID {WbsHeaderId}, TenantId {TenantId}",
                    wbsHeader.Id, wbsHeader.TenantId);
            }

            // 2. Handle WorkBreakdownStructures (WBS Groups)
            // NOTE: WorkBreakdownStructureId in DTO maps to Id in WorkBreakdownStructure entity
            var existingWBSGroupsDict = wbsHeader.WorkBreakdownStructures.ToDictionary(w => w.Id);
            var incomingWBSGroupIds = request.WBSMaster.WorkBreakdownStructures
                .Where(dto => dto.WorkBreakdownStructureId > 0)
                .Select(dto => dto.WorkBreakdownStructureId)
                .ToHashSet();

            _logger.LogInformation("SetWBSCommandHandler: Processing {Count} WBS groups. Existing groups: {ExistingIds}",
                request.WBSMaster.WorkBreakdownStructures.Count,
                string.Join(", ", existingWBSGroupsDict.Keys));

            foreach (var wbsGroupDto in request.WBSMaster.WorkBreakdownStructures)
            {
                WorkBreakdownStructure wbsGroupEntity;
                if (wbsGroupDto.WorkBreakdownStructureId > 0 && existingWBSGroupsDict.TryGetValue(wbsGroupDto.WorkBreakdownStructureId, out wbsGroupEntity))
                {
                    _logger.LogInformation("SetWBSCommandHandler: Updating existing WBS group ID {Id}, Name: {Name}",
                        wbsGroupDto.WorkBreakdownStructureId, wbsGroupDto.Name);

                    // Update existing WBS Group
                    wbsGroupEntity.Name = wbsGroupDto.Name;
                    wbsGroupEntity.Description = wbsGroupDto.Description;
                    wbsGroupEntity.DisplayOrder = wbsGroupDto.DisplayOrder;
                    wbsGroupEntity.TenantId = wbsHeader.TenantId; // Ensure TenantId is set
                    // Removed UpdatedAt and UpdatedBy as WorkBreakdownStructure no longer has these properties
                    _context.WorkBreakdownStructures.Update(wbsGroupEntity);
                }
                else
                {
                    _logger.LogInformation("SetWBSCommandHandler: Creating new WBS group, Name: {Name}",
                        wbsGroupDto.Name);

                    // Create new WBS Group
                    wbsGroupEntity = new WorkBreakdownStructure
                    {
                        TenantId = wbsHeader.TenantId, // IMPORTANT: Set TenantId for tenant isolation
                        WBSHeader = wbsHeader,
                        WBSHeaderId = wbsHeader.Id,
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

                // Save changes to get the WorkBreakdownStructure ID before processing tasks
                _logger.LogInformation("SetWBSCommandHandler: Saving WBS group '{Name}' to get ID", wbsGroupDto.Name);
                await _unitOfWork.SaveChangesAsync();
                _logger.LogInformation("SetWBSCommandHandler: WBS group saved with ID {Id}", wbsGroupEntity.Id);

            // 3. Handle WBSTasks within each WBS Group recursively
            var allTasks = new List<WBSTask>();
            var newTasksNeedingChildData = new List<(WBSTask task, WBSTaskDto dto)>();

            _logger.LogInformation("SetWBSCommandHandler: Processing {Count} tasks for WBS group '{Name}'",
                wbsGroupDto.Tasks.Count, wbsGroupDto.Name);

            // Process tasks and their children recursively - but don't set parent IDs yet
            await ProcessTasksRecursively(wbsGroupDto.Tasks, wbsGroupEntity, null, allTasks, wbsHeader, newTasksNeedingChildData);

                _logger.LogInformation("SetWBSCommandHandler: Saving changes after processing tasks");
                await _unitOfWork.SaveChangesAsync();
                _logger.LogInformation("SetWBSCommandHandler: Successfully saved {Count} tasks", allTasks.Count);
                
                // Now that all tasks have IDs, perform the parent-child relationship inference
                await InferParentChildRelationships(allTasks);

                // Now update UserWBSTasks and PlannedHours for newly created tasks (they now have IDs)
                _logger.LogInformation("SetWBSCommandHandler: Updating UserWBSTasks and PlannedHours for {Count} new tasks", newTasksNeedingChildData.Count);
                foreach (var (task, dto) in newTasksNeedingChildData)
                {
                    await UpdateUserAssignment(task, dto);
                    await UpdatePlannedHours(task, dto, wbsHeader.Version, wbsHeader.ProjectId);
                }

                if (newTasksNeedingChildData.Count > 0)
                {
                    _logger.LogInformation("SetWBSCommandHandler: Saving UserWBSTasks and PlannedHours");
                    await _unitOfWork.SaveChangesAsync();
                _logger.LogInformation("SetWBSCommandHandler: Successfully saved UserWBSTasks and PlannedHours");
                }

                // Update DTOs with final values after saving (e.g., WBSOptionLabel)
                foreach (var dto in wbsGroupDto.Tasks)
                {
                    var correspondingEntity = allTasks.FirstOrDefault(t => t.Id == dto.Id);
                    if (correspondingEntity != null)
                    {
                        dto.Title = correspondingEntity.Title;
                        // Update WBSOptionLabel
                        if (correspondingEntity.WBSOptionId > 0)
                        {
                            var wbsOption = await _wbsOptionRepository.GetByIdAsync(correspondingEntity.WBSOptionId);
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

            // Return the updated WBSMasterDto with the newly created data
            // Update the WbsHeaderId in the response to match the created/updated header
            request.WBSMaster.WbsHeaderId = wbsHeader.Id;
            return request.WBSMaster;
        }

        /// <summary>
        /// Processes a flat list of WBSTaskDto, handling creation, updates, and parent-child relationships.
        /// Parent-child relationships are managed through ParentId property, which should refer to WBS task IDs, not WBS option IDs.
        /// If ParentId is null, the relationship will be inferred based on task level and position in the sequence.
        /// </summary>
        private async Task ProcessTasksRecursively(
            ICollection<WBSTaskDto> taskDtos,
            WorkBreakdownStructure wbsGroupEntity,
            int? parentId,
            List<WBSTask> allTasks,
            WBSHeader wbsHeader,
            List<(WBSTask task, WBSTaskDto dto)> newTasksNeedingChildData)
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
                    taskEntity.TenantId = wbsHeader.TenantId; // Ensure TenantId is set
                    taskEntity.WorkBreakdownStructureId = wbsGroupEntity.Id; // Ensure foreign key is set
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

                    // Handle WBS Option Label - Only set WBSOptionLabel, don't overwrite the title
                    if (dto.WBSOptionId > 0)
                    {
                        var wbsOption = await _wbsOptionRepository.GetByIdAsync(dto.WBSOptionId);
                        if (wbsOption != null)
                        {
                            // Only set the WBSOptionLabel, preserve the original title
                            dto.WBSOptionLabel = wbsOption.Label;
                        }
                    }

                    await UpdateUserAssignment(taskEntity, dto);
                    await UpdatePlannedHours(taskEntity, dto, wbsHeader.Version, wbsHeader.ProjectId);
                }
                else
                {
                    // Create new task
                    taskEntity = new WBSTask
                    {
                        TenantId = wbsHeader.TenantId, // IMPORTANT: Set TenantId for tenant isolation
                        WorkBreakdownStructure = wbsGroupEntity,
                        WorkBreakdownStructureId = wbsGroupEntity.Id, // IMPORTANT: Set foreign key explicitly
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
                        Title = dto.Title,
                        // ParentId will be set in the second pass after all tasks are created and have IDs.
                        // We use dto.ParentId which directly references another WBS task's ID - not a WBS option ID
                        // The actual WBS task ID will be resolved in the lookup dictionary
                        ParentId = null // Placeholder, will be set in the second pass
                    };

                    // Handle WBS Option Label - Only set WBSOptionLabel, don't overwrite the title
                    if (dto.WBSOptionId > 0)
                    {
                        var wbsOption = await _wbsOptionRepository.GetByIdAsync(dto.WBSOptionId);
                        if (wbsOption != null)
                        {
                            // Only set the WBSOptionLabel, preserve the original title
                            dto.WBSOptionLabel = wbsOption.Label;
                        }
                    }

                    _context.WBSTasks.Add(taskEntity);
                    wbsGroupEntity.Tasks.Add(taskEntity);

                    // Store task and DTO for second pass to resolve ParentId
                    newTasksNeedingChildData.Add((taskEntity, dto));
                }

                allTasks.Add(taskEntity);
            }

            // Second Pass: Resolve ParentIds for newly created tasks
            // Create a map of task DTO ID to task entity for easy lookup.
            // Use original DTO IDs (including 0 for new tasks) as keys, with a temporary counter for uniqueness.
            var taskLookup = new Dictionary<int, WBSTask>();
            int tempIdCounter = -1;

            // Populate the lookup map from the newTasksNeedingChildData list.
            foreach (var (taskEntity, dto) in newTasksNeedingChildData)
            {
                // Generate a unique key for new tasks (dto.Id <= 0) by decrementing the counter *before* use.
                int keyForLookup = dto.Id > 0 ? dto.Id : tempIdCounter;
                
                if (!taskLookup.ContainsKey(keyForLookup))
                {
                    taskLookup.Add(keyForLookup, taskEntity);
                }
                else
                {
                    // This should not happen with the corrected logic, but as a safeguard:
                    _logger.LogWarning("Duplicate key {Key} generated for task lookup in SetWBSCommandHandler. Skipping.", keyForLookup);
                }
                
                // Decrement counter for the next new task.
                if (dto.Id <= 0) tempIdCounter--;
            }

            // Now, resolve ParentIds using the created map.
            foreach (var (taskEntity, dto) in newTasksNeedingChildData)
            {
                if (dto.ParentId.HasValue && dto.ParentId.Value > 0)
                {
                    // Try to find the parent using the parent DTO ID.
                    if (taskLookup.TryGetValue(dto.ParentId.Value, out var parentTaskEntity))
                    {
                        _logger.LogInformation("SetWBSCommandHandler: Resolving ParentId for Task DTO ID {TaskDtoId} (Original ID: {OriginalTaskId}). Parent DTO ID: {ParentDtoId}. Assigning ParentId: {ParentEntityId}",
                            taskEntity.Id, dto.Id, dto.ParentId.Value, parentTaskEntity.Id);
                        taskEntity.ParentId = parentTaskEntity.Id;
                    }
                    else
                    {
                        _logger.LogWarning("Parent task with DTO ID {ParentDtoId} not found for task with DTO ID {TaskDtoId}. ParentId will not be set.",
                            dto.ParentId.Value, dto.Id);
                    }
                }
                else
                {
                    // If ParentId is null in DTO, we'll infer it based on task level and position in sequence
                    taskEntity.ParentId = null; // Default to null, we'll set it below if needed
                }
            }

            // Update UserWBSTasks and PlannedHours for newly created tasks (they now have IDs)
            _logger.LogInformation("SetWBSCommandHandler: Updating UserWBSTasks and PlannedHours for {Count} new tasks", newTasksNeedingChildData.Count);
            foreach (var (task, dto) in newTasksNeedingChildData)
            {
                await UpdateUserAssignment(task, dto);
                await UpdatePlannedHours(task, dto, wbsHeader.Version, wbsHeader.ProjectId);
            }
            
            // Third Pass: Infer parent-child relationships based on task level and position for those with null ParentId
            await InferParentChildRelationships(allTasks);
        }

        /// <summary>
        /// Infers parent-child relationships for tasks based on their level and position in the sequence.
        /// Level 1 tasks are top-level, Level 2 tasks are children of the most recent Level 1 task,
        /// and Level 3 tasks are children of the most recent Level 2 task.
        /// </summary>
        private async Task InferParentChildRelationships(List<WBSTask> tasks)
        {
            _logger.LogInformation("SetWBSCommandHandler: Inferring parent-child relationships based on task levels");
            
            // Sort tasks by display order to ensure proper sequence
            var orderedTasks = tasks.OrderBy(t => t.DisplayOrder).ToList();
            
            // Track the most recent task of each level
            Dictionary<WBSTaskLevel, WBSTask> latestTaskByLevel = new Dictionary<WBSTaskLevel, WBSTask>();
            
            foreach (var task in orderedTasks)
            {
                // Skip if ParentId is already set (either from DTO or previous inference)
                if (task.ParentId.HasValue)
                {
                    continue;
                }
                
                // Set parent relationship based on level
                switch (task.Level)
                {
                    case WBSTaskLevel.Level1:
                        // Level 1 tasks are top-level, no parent needed
                        task.ParentId = null;
                        break;
                    
                    case WBSTaskLevel.Level2:
                        // Level 2 tasks should be children of the most recent Level 1 task
                        if (latestTaskByLevel.TryGetValue(WBSTaskLevel.Level1, out var parentLevel1))
                        {
                            task.ParentId = parentLevel1.Id;
                            _logger.LogInformation("SetWBSCommandHandler: Setting Level 2 task {TaskId} parent to Level 1 task {ParentId}", 
                                task.Id, parentLevel1.Id);
                        }
                        break;
                    
                    case WBSTaskLevel.Level3:
                        // Level 3 tasks should be children of the most recent Level 2 task
                        if (latestTaskByLevel.TryGetValue(WBSTaskLevel.Level2, out var parentLevel2))
                        {
                            task.ParentId = parentLevel2.Id;
                            _logger.LogInformation("SetWBSCommandHandler: Setting Level 3 task {TaskId} parent to Level 2 task {ParentId}", 
                                task.Id, parentLevel2.Id);
                        }
                        break;
                    
                    default:
                        // For any other levels (if added in the future), follow the same pattern
                        int previousLevel = (int)task.Level - 1;
                        if (previousLevel >= 1 && 
                            Enum.IsDefined(typeof(WBSTaskLevel), previousLevel) && 
                            latestTaskByLevel.TryGetValue((WBSTaskLevel)previousLevel, out var parentTask))
                        {
                            task.ParentId = parentTask.Id;
                            _logger.LogInformation("SetWBSCommandHandler: Setting Level {Level} task {TaskId} parent to Level {ParentLevel} task {ParentId}", 
                                (int)task.Level, task.Id, previousLevel, parentTask.Id);
                        }
                        break;
                }
                
                // Update the latest task of this level
                latestTaskByLevel[task.Level] = task;
            }
            
            // Apply the changes to the database
            await _unitOfWork.SaveChangesAsync();
        }

        // Removed GetWbsOptionParentId as it's no longer needed for setting ParentId
        // private async Task<int?> GetWbsOptionParentId(int wbsOptionId)
        // {
        //     if (wbsOptionId <= 0) return null;

        //     var wbsOption = await _wbsOptionRepository.GetByIdAsync(wbsOptionId);
        //     return wbsOption?.ParentId;
        // }

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

            // Note: In the current schema, task version history doesn't track parent-child relationships
            // If this functionality is needed in the future, we would need to add a ParentTaskVersionId property
            // to the WBSTaskVersionHistory class
            foreach (var task in tasks)
            {
                // If we had the ParentTaskVersionId property, we would set it here based on the task's ParentId
                // For now, we just log that parent-child relationships are not maintained in versions
                if (task.ParentId.HasValue && taskMap.ContainsKey(task.ParentId.Value))
                {
                    _logger.LogInformation("Task {TaskId} has parent {ParentId}, but parent-child relationships are not tracked in version history",
                        task.Id, task.ParentId.Value);
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
                    
                    // Fallback: Check if AssignedUserName contains a GUID (User ID) if actualUserId is null
                    if (string.IsNullOrEmpty(actualUserId) && !string.IsNullOrEmpty(dto.AssignedUserName) && dto.AssignedUserName != "string")
                    {
                        // Simple check if it looks like a GUID (or just treat it as ID since frontend sends ID in name)
                        // In this specific case, the user says the ID is in the name field.
                        // We'll assume if it's not "string", it might be the ID.
                        // Ideally we should validate if it's a GUID, but for now we'll trust the payload pattern described.
                        if (Guid.TryParse(dto.AssignedUserName, out _))
                        {
                             actualUserId = dto.AssignedUserName;
                        }
                    }

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

            // Build histories and associate them with the header using navigation property
            var histories = await BuildInitialHistoryEntriesAsync(project, header);
            _context.WBSHistories.AddRange(histories);

            // Save both header and histories in a single transaction
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


                var histories = await BuildInitialHistoryEntriesAsync(project, header.Id, false);
                _context.WBSHistories.AddRange(histories);

                header.StatusId = (int)PMWorkflowStatusEnum.Initial;
                _context.Set<WBSTaskPlannedHourHeader>().Update(header);


                await _unitOfWork.SaveChangesAsync();
            }
        }


        private async Task<List<WBSHistory>> BuildInitialHistoryEntriesAsync(Project project, WBSTaskPlannedHourHeader header, bool isSoftDelete = false)
        {
            var userId = _userContext.GetCurrentUserId();
            var actionDate = DateTime.UtcNow;
            var histories = new List<WBSHistory>();

            // Validate that the ActionBy user exists if provided
            string validActionBy = null;
            if (!string.IsNullOrEmpty(userId))
            {
                var userExists = await _context.Users.AnyAsync(u => u.Id == userId);
                if (userExists)
                {
                    validActionBy = userId;
                }
                else
                {
                    _logger.LogWarning("User with ID {UserId} not found in AspNetUsers table. Setting ActionBy to null.", userId);
                }
            }

            async Task AddHistoryAsync(string assignedToId)
            {
                if (!string.IsNullOrEmpty(assignedToId))
                {
                    // Validate that the assigned user exists
                    var assignedUserExists = await _context.Users.AnyAsync(u => u.Id == assignedToId);
                    if (assignedUserExists)
                    {
                        histories.Add(new WBSHistory
                        {
                            StatusId = (int)PMWorkflowStatusEnum.Initial,
                            Action = "Initial",
                            Comments = "WBS ODC data has been updated",
                            ActionDate = actionDate,
                            ActionBy = validActionBy,
                            AssignedToId = assignedToId,
                            WBSTaskPlannedHourHeader = header,
                            IsDeleted = isSoftDelete
                        });
                    }
                    else
                    {
                        _logger.LogWarning("Assigned user with ID {AssignedToId} not found in AspNetUsers table. Skipping history entry.", assignedToId);
                    }
                }
            }

            await AddHistoryAsync(project.ProjectManagerId);
            await AddHistoryAsync(project.SeniorProjectManagerId);
            await AddHistoryAsync(project.RegionalManagerId);

            return histories;
        }

        private async Task<List<WBSHistory>> BuildInitialHistoryEntriesAsync(Project project, int headerId, bool isSoftDelete = false)
        {
            var userId = _userContext.GetCurrentUserId();
            var actionDate = DateTime.UtcNow;
            var histories = new List<WBSHistory>();

            // Validate that the ActionBy user exists if provided
            string validActionBy = null;
            if (!string.IsNullOrEmpty(userId))
            {
                var userExists = await _context.Users.AnyAsync(u => u.Id == userId);
                if (userExists)
                {
                    validActionBy = userId;
                }
                else
                {
                    _logger.LogWarning("User with ID {UserId} not found in AspNetUsers table. Setting ActionBy to null.", userId);
                }
            }

            async Task AddHistoryAsync(string assignedToId)
            {
                if (!string.IsNullOrEmpty(assignedToId))
                {
                    // Validate that the assigned user exists
                    var assignedUserExists = await _context.Users.AnyAsync(u => u.Id == assignedToId);
                    if (assignedUserExists)
                    {
                        histories.Add(new WBSHistory
                        {
                            StatusId = (int)PMWorkflowStatusEnum.Initial,
                            Action = "Initial",
                            Comments = "WBS ODC data has been updated",
                            ActionDate = actionDate,
                            ActionBy = validActionBy,
                            AssignedToId = assignedToId,
                            WBSTaskPlannedHourHeaderId = headerId,
                            IsDeleted = isSoftDelete
                        });
                    }
                    else
                    {
                        _logger.LogWarning("Assigned user with ID {AssignedToId} not found in AspNetUsers table. Skipping history entry.", assignedToId);
                    }
                }
            }

            await AddHistoryAsync(project.ProjectManagerId);
            await AddHistoryAsync(project.SeniorProjectManagerId);
            await AddHistoryAsync(project.RegionalManagerId);

            return histories;
        }

    }
}

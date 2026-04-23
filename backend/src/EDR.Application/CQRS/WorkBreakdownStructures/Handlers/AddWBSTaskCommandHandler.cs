using MediatR;
using Microsoft.EntityFrameworkCore;
using EDR.Application.CQRS.WorkBreakdownStructures.Commands;
using EDR.Application.Dtos;
using EDR.Application.Services.IContract;
using EDR.Domain.Database;
using EDR.Domain.Entities;
using EDR.Domain.Enums;
using EDR.Domain.UnitWork;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using EDR.Repositories.Interfaces;

namespace EDR.Application.CQRS.WorkBreakdownStructures.Handlers
{
    public class AddWBSTaskCommandHandler : IRequestHandler<AddWBSTaskCommand, WBSMasterDto>
    {
        private readonly ProjectManagementContext _context;
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILogger<AddWBSTaskCommandHandler> _logger;
        private readonly IWBSOptionRepository _wbsOptionRepository;
        private readonly IUserContext _userContext;
        private readonly IWBSVersionRepository _wbsVersionRepository;
        private readonly IProjectHistoryService _projectHistoryService;
        private readonly string _currentUser = "System";

        public AddWBSTaskCommandHandler(
            ProjectManagementContext context,
            IUnitOfWork unitOfWork,
            ILogger<AddWBSTaskCommandHandler> logger,
            IWBSOptionRepository wbsOptionRepository,
            IUserContext userContext,
            IWBSVersionRepository wbsVersionRepository,
            IProjectHistoryService projectHistoryService)
        {
            _context = context;
            _unitOfWork = unitOfWork;
            _logger = logger;
            _wbsOptionRepository = wbsOptionRepository;
            _userContext = userContext;
            _wbsVersionRepository = wbsVersionRepository;
            _projectHistoryService = projectHistoryService;
        }

        public async Task<WBSMasterDto> Handle(AddWBSTaskCommand request, CancellationToken cancellationToken)
        {
            _logger.LogInformation("Handling AddWBSTaskCommand for ProjectId {ProjectId}, TenantId {TenantId}",
                request.ProjectId, _context.TenantId);

            // 0. Verify Project exists
            var projectExists = await _context.Projects
                .AnyAsync(p => p.Id == request.ProjectId, cancellationToken);
            
            if (!projectExists)
            {
                _logger.LogError("Project with ID {ProjectId} not found for current tenant.", request.ProjectId);
                throw new ArgumentException($"Project with ID {request.ProjectId} not found or you don't have access to it.");
            }

            // 1. Find or create WBSHeader
            var wbsHeader = await FindOrCreateWBSHeader(request, cancellationToken);
            
            // Map the header ID back to the return DTO
            request.WBSMaster.WbsHeaderId = wbsHeader.Id;

            // 2. Process each WorkBreakdownStructure
            foreach (var wbsGroupDto in request.WBSMaster.WorkBreakdownStructures)
            {
                var wbsGroupEntity = await ProcessWorkBreakdownStructure(wbsHeader, wbsGroupDto, cancellationToken);
                
                // Save group first to ensure we have an ID
                await _unitOfWork.SaveChangesAsync();
                
                // Map the group ID back to the DTO
                wbsGroupDto.WorkBreakdownStructureId = wbsGroupEntity.Id;

                var allNewTasks = new List<WBSTask>();
                var tasksNeedingChildData = new List<(WBSTask task, WBSTaskDto dto)>();

                // Track which existing tasks have been "claimed" by an incoming DTO to allow multiples of same level
                var claimedTaskIds = new HashSet<int>();

                // 3. Upsert Tasks (First Pass - Basic Info)
                foreach (var taskDto in wbsGroupDto.Tasks)
                {
                    WBSTask taskEntity = null;
                    if (taskDto.Id > 0)
                    {
                        taskEntity = await _context.WBSTasks
                            .Include(t => t.UserWBSTasks)
                            .Include(t => t.PlannedHours)
                            .FirstOrDefaultAsync(t => t.Id == taskDto.Id, cancellationToken);
                    }

                    // IDENTITY SEARCH REMOVED: This allows for multiple tasks of same level
                    if (taskEntity != null)
                    {
                        // Update existing task
                        taskEntity.Title = string.IsNullOrEmpty(taskDto.Title) ? taskEntity.Title : taskDto.Title;
                        taskEntity.Description = taskDto.Description;
                        taskEntity.Level = taskDto.Level;
                        taskEntity.DisplayOrder = taskDto.DisplayOrder;
                        taskEntity.EstimatedBudget = taskDto.EstimatedBudget;
                        taskEntity.StartDate = taskDto.StartDate;
                        taskEntity.EndDate = taskDto.EndDate;
                        taskEntity.TaskType = taskDto.TaskType;
                        taskEntity.WBSOptionId = taskDto.WBSOptionId;
                        taskEntity.IsDeleted = false; // RESTORE
                        taskEntity.UpdatedAt = DateTime.UtcNow;
                        taskEntity.UpdatedBy = _userContext.GetCurrentUserId() ?? _currentUser;

                        _context.WBSTasks.Update(taskEntity);
                    }
                    else
                    {
                        // Create new task
                        taskEntity = await CreateWBSTaskBasic(taskDto, wbsGroupEntity, wbsHeader.TenantId, cancellationToken);
                        _context.WBSTasks.Add(taskEntity);
                    }

                    allNewTasks.Add(taskEntity);
                    tasksNeedingChildData.Add((taskEntity, taskDto));
                }

                // 4. Save Tasks to generate IDs
                await _unitOfWork.SaveChangesAsync();

                // 5. Resolve Parent IDs (Second Pass)
                // Now that we have IDs, we can resolve explicit ParentIds from DTOs
                // and infer relationships based on levels.
                await ResolveParentIds(tasksNeedingChildData, allNewTasks);
                
                // 6. Infer Parent-Child Relationships for remaining tasks (Third Pass)
                await InferParentChildRelationships(allNewTasks);

                // 7. Update User Assignment and Planned Hours (Fourth Pass)
                // Now that tasks are stable and have IDs.
                foreach (var (task, dto) in tasksNeedingChildData)
                {
                    // Update WBSOptionLabel in DTO for response
                    if (task.WBSOptionId > 0)
                    {
                        var wbsOption = await _wbsOptionRepository.GetByIdAsync(task.WBSOptionId);
                        if (wbsOption != null) dto.WBSOptionLabel = wbsOption.Label;
                    }

                    await UpdateUserAssignment(task, dto);
                    await UpdatePlannedHours(task, dto, wbsHeader.Version, request.ProjectId);
                }

                // 8. Final Save
                await _unitOfWork.SaveChangesAsync();
                
                // 9. Update DTOs with final IDs for response
                 foreach (var (task, dto) in tasksNeedingChildData)
                 {
                     dto.Id = task.Id;
                 }

            }
            
            // 10. Global Cleanup: Remove any groups with 0 active tasks (handles orphaned groups too)
            _logger.LogInformation("AddWBSTaskCommandHandler: Performing global cleanup of empty groups for WBSHeader ID {WbsHeaderId}", wbsHeader.Id);
            var allHeaderGroups = await _context.WorkBreakdownStructures
                .Include(w => w.Tasks)
                .Where(w => w.WBSHeaderId == wbsHeader.Id)
                .ToListAsync(cancellationToken);

            foreach(var group in allHeaderGroups) 
            {
                var activeTasksCount = group.Tasks.Count(t => !t.IsDeleted);
                if (activeTasksCount == 0)
                {
                    _logger.LogInformation("AddWBSTaskCommandHandler: Found orphaned group '{Name}' (ID {Id}) with 0 active tasks. Deleting.", 
                        group.Name, group.Id);
                    _context.WorkBreakdownStructures.Remove(group);
                }
            }
            await _unitOfWork.SaveChangesAsync();

            // 11. Create WBSVersionHistory and link granular versions
            var project = await _context.Projects.AsNoTracking().FirstOrDefaultAsync(p => p.Id == request.ProjectId, cancellationToken);
            await CreateWBSVersionAfterUpdate(wbsHeader, project);

            return request.WBSMaster;
        }

        private async Task<WBSHeader> FindOrCreateWBSHeader(AddWBSTaskCommand request, CancellationToken cancellationToken)
        {
            WBSHeader wbsHeader;
            if (request.WBSMaster.WbsHeaderId > 0)
            {
                // Debugging: Find by ID first to see if it exists at all
                var candidateHeader = await _context.WBSHeaders
                    .IgnoreQueryFilters()
                    .FirstOrDefaultAsync(h => h.Id == request.WBSMaster.WbsHeaderId, cancellationToken);

                if (candidateHeader == null)
                {
                    _logger.LogError("WBSHeader with ID {Id} does not exist in the database (ignoring filters).", request.WBSMaster.WbsHeaderId);
                    throw new ArgumentException($"WBSHeader with ID {request.WBSMaster.WbsHeaderId} not found (Record does not exist).");
                }

                if (candidateHeader.ProjectId != request.ProjectId)
                {
                    _logger.LogError("WBSHeader found (ID: {Id}) but ProjectId mismatch. Database: {DbProject}, Request: {ReqProject}", 
                        candidateHeader.Id, candidateHeader.ProjectId, request.ProjectId);
                    throw new ArgumentException($"WBSHeader with ID {request.WBSMaster.WbsHeaderId} belongs to Project {candidateHeader.ProjectId}, not {request.ProjectId}.");
                }

                // Now load with includes
                wbsHeader = await _context.WBSHeaders
                    .IgnoreQueryFilters()
                    .Include(h => h.WorkBreakdownStructures)
                        .ThenInclude(wbs => wbs.Tasks.Where(t => !t.IsDeleted))
                    .Include(h => h.VersionHistories)
                    .FirstAsync(h => h.Id == request.WBSMaster.WbsHeaderId, cancellationToken);
                
                // Increment version
                bool isCurrentlyApproved = wbsHeader.ApprovalStatus == PMWorkflowStatusEnum.Approved;
                wbsHeader.Version = CalculateNextVersion(wbsHeader.Version, isCurrentlyApproved);

                if (isCurrentlyApproved)
                {
                    _logger.LogInformation("AddWBSTaskCommandHandler: WBS was previously approved. Incrementing major version to {Version} and resetting status to Initial.", wbsHeader.Version);
                    wbsHeader.ApprovalStatus = PMWorkflowStatusEnum.Initial;
                }
                else
                {
                    _logger.LogInformation("AddWBSTaskCommandHandler: Incrementing minor version to {Version}.", wbsHeader.Version);
                }

                wbsHeader.VersionDate = DateTime.UtcNow;
                wbsHeader.CreatedBy = _userContext.GetCurrentUserId() ?? _currentUser;
                _context.WBSHeaders.Update(wbsHeader);
                
                // Security Check & Repair
                int currentTenantId = _context.TenantId ?? 0;
                
                // If header has no tenant (0), claim it for the current tenant
                if (wbsHeader.TenantId == 0 && currentTenantId != 0)
                {
                    _logger.LogInformation("Repairing WBSHeader {Id}: Setting TenantId to {TenantId}", wbsHeader.Id, currentTenantId);
                    wbsHeader.TenantId = currentTenantId;
                    _context.WBSHeaders.Update(wbsHeader);
                }
                // If header has a tenant, and we are in a tenant context, ensure they match
                else if (wbsHeader.TenantId != 0 && currentTenantId != 0 && wbsHeader.TenantId != currentTenantId) 
                {
                     // Log but maybe don't block? Or blocking is correct? 
                     // Users should not be adding tasks to other tenants' headers.
                     _logger.LogWarning("Access Denied: WBSHeader {Id} belongs to Tenant {HeaderTenant} but requested by Tenant {CurrentTenant}", 
                        wbsHeader.Id, wbsHeader.TenantId, currentTenantId);
                     throw new ArgumentException($"WBSHeader with ID {request.WBSMaster.WbsHeaderId} not found (Tenant Mismatch).");
                }
            }
            else
            {
                // If WbsHeaderId is not provided, try to find an existing active header for this project
                _logger.LogInformation("AddWBSTaskCommandHandler: No WbsHeaderId provided. Searching for an existing active header for ProjectId {ProjectId}", request.ProjectId);

                wbsHeader = await _context.WBSHeaders
                    .Include(h => h.WorkBreakdownStructures)
                        .ThenInclude(wbs => wbs.Tasks.Where(t => !t.IsDeleted))
                    .Include(h => h.VersionHistories)
                    .Where(h => h.ProjectId == request.ProjectId && h.IsActive)
                    .OrderByDescending(h => h.Id)
                    .FirstOrDefaultAsync(cancellationToken);

                if (wbsHeader != null)
                {
                    _logger.LogInformation("AddWBSTaskCommandHandler: Found and reusing existing active WBSHeader with ID {WbsHeaderId} for project {ProjectId}", wbsHeader.Id, request.ProjectId);
                    
                    // Update version
                    bool isCurrentlyApproved = wbsHeader.ApprovalStatus == PMWorkflowStatusEnum.Approved;
                    wbsHeader.Version = CalculateNextVersion(wbsHeader.Version, isCurrentlyApproved);
                    
                    if (isCurrentlyApproved)
                    {
                        wbsHeader.ApprovalStatus = PMWorkflowStatusEnum.Initial;
                    }

                    wbsHeader.VersionDate = DateTime.UtcNow;
                    wbsHeader.CreatedBy = _userContext.GetCurrentUserId() ?? _currentUser;
                    _context.WBSHeaders.Update(wbsHeader);
                }
                else
                {
                    _logger.LogInformation("AddWBSTaskCommandHandler: No active header found. Creating new WBSHeader for ProjectId {ProjectId}", request.ProjectId);

                    // Double-check project existence without filters to diagnose FK issues if needed, 
                    // but for creation we must respect the tenant filter to ensure data integrity.
                    
                    wbsHeader = new WBSHeader
                    {
                        TenantId = _context.TenantId ?? 0,
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
                    
                    try 
                    {
                        await _unitOfWork.SaveChangesAsync();
                    }
                    catch (DbUpdateException ex)
                    {
                        _logger.LogError(ex, "Database error while creating WBSHeader for ProjectId {ProjectId}. This is likely a Foreign Key violation.", request.ProjectId);
                        throw new Exception($"Failed to create WBS Header. Please ensure Project {request.ProjectId} exists. Detail: {ex.InnerException?.Message ?? ex.Message}");
                    }
                    
                    _logger.LogInformation("AddWBSTaskCommandHandler: Created new WBSHeader with ID {WbsHeaderId}, TenantId {TenantId}",
                        wbsHeader.Id, wbsHeader.TenantId);
                }
            }
            return wbsHeader;
        }

        private async Task<WorkBreakdownStructure> ProcessWorkBreakdownStructure(
            WBSHeader wbsHeader,
            WBSStructureMasterDto wbsGroupDto,
            CancellationToken cancellationToken)
        {
            WorkBreakdownStructure wbsGroupEntity;

            if (wbsGroupDto.WorkBreakdownStructureId > 0)
            {
                wbsGroupEntity = wbsHeader.WorkBreakdownStructures
                    .FirstOrDefault(w => w.Id == wbsGroupDto.WorkBreakdownStructureId);

                if (wbsGroupEntity == null)
                {
                    throw new ArgumentException($"WorkBreakdownStructure with ID {wbsGroupDto.WorkBreakdownStructureId} not found.");
                }

                wbsGroupEntity.Name = wbsGroupDto.Name;
                wbsGroupEntity.Description = wbsGroupDto.Description;
                wbsGroupEntity.DisplayOrder = wbsGroupDto.DisplayOrder;
                wbsGroupEntity.TenantId = wbsHeader.TenantId;
                _context.WorkBreakdownStructures.Update(wbsGroupEntity);
            }
            else
            {
                // If ID is not provided, try to find by NAME within this header
                wbsGroupEntity = wbsHeader.WorkBreakdownStructures
                    .FirstOrDefault(w => w.Name != null && w.Name.Equals(wbsGroupDto.Name, StringComparison.OrdinalIgnoreCase));

                if (wbsGroupEntity != null)
                {
                    _logger.LogInformation("ProcessWorkBreakdownStructure: Found and reusing existing WBS Group '{GroupName}' (ID: {GroupId})", wbsGroupEntity.Name, wbsGroupEntity.Id);
                    
                    // Update details if necessary
                    wbsGroupEntity.Description = wbsGroupDto.Description;
                    wbsGroupEntity.DisplayOrder = wbsGroupDto.DisplayOrder;
                    _context.WorkBreakdownStructures.Update(wbsGroupEntity);
                }
                else
                {
                    _logger.LogInformation("ProcessWorkBreakdownStructure: Creating new WBS Group '{GroupName}'", wbsGroupDto.Name);
                    
                    wbsGroupEntity = new WorkBreakdownStructure
                    {
                        TenantId = wbsHeader.TenantId,
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
            }

            return wbsGroupEntity;
        }

        private async Task<WBSTask> CreateWBSTaskBasic(
            WBSTaskDto taskDto,
            WorkBreakdownStructure wbsGroupEntity,
            int tenantId,
            CancellationToken cancellationToken)
        {
            // Validate required fields
            if (taskDto.WBSOptionId <= 0)
            {
                _logger.LogError("WBSOptionId is required for task: {Title}", taskDto.Title);
                throw new Exception($"WBSOptionId is required for task '{taskDto.Title}'.");
            }

            if (taskDto.Level <= 0)
            {
                 _logger.LogError("Task Level is required and must be greater than 0 for task: {Title}", taskDto.Title);
                throw new Exception($"Task Level is required and must be greater than 0 for task '{taskDto.Title}'.");
            }

            // Get Title from WBSOption if not provided
            if (string.IsNullOrEmpty(taskDto.Title))
            {
                var wbsOption = await _wbsOptionRepository.GetByIdAsync(taskDto.WBSOptionId);
                if (wbsOption != null)
                {
                    taskDto.Title = wbsOption.Label;
                    taskDto.WBSOptionLabel = wbsOption.Label;
                    _logger.LogInformation("CreateWBSTaskBasic: Automatically set Title to '{Title}' from WBSOption {OptionId}", taskDto.Title, taskDto.WBSOptionId);
                }
            }

            if (string.IsNullOrEmpty(taskDto.Title))
            {
                _logger.LogError("Task Title is required and could not be determined from WBSOptionId {OptionId}.", taskDto.WBSOptionId);
                throw new Exception($"Task Title is required and could not be determined from WBSOptionId {taskDto.WBSOptionId}.");
            }

            // Create task entity
            var taskEntity = new WBSTask
            {
                TenantId = tenantId, // IMPORTANT: Set TenantId
                WorkBreakdownStructureId = wbsGroupEntity.Id,
                Description = taskDto.Description ?? string.Empty,
                Level = taskDto.Level,
                DisplayOrder = taskDto.DisplayOrder,
                EstimatedBudget = taskDto.EstimatedBudget,
                StartDate = taskDto.StartDate,
                EndDate = taskDto.EndDate,
                TaskType = taskDto.TaskType,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = _userContext.GetCurrentUserId() ?? _currentUser,
                IsDeleted = false,
                UserWBSTasks = new List<UserWBSTask>(),
                PlannedHours = new List<WBSTaskPlannedHour>(),
                WBSOptionId = taskDto.WBSOptionId,
                Title = taskDto.Title,
                ParentId = null // Will be set later
            };

            return taskEntity;
        }

        private async Task ResolveParentIds(
            List<(WBSTask task, WBSTaskDto dto)> tasksNeedingChildData,
            List<WBSTask> allNewTasks)
        {
            // Create lookup for new tasks using DTO ID as key (if DTO ID > 0)
            // Note: Since this is "Add", DTO IDs might be temporary or 0.
            // If the frontend sends temporary IDs (e.g., negative or sequence), we can use them.
            // If DTO IDs are 0, we can only rely on order/inference.
            
            // Assuming frontend might send temporary IDs or we rely on explicit mapping if provided.
            var taskLookup = tasksNeedingChildData
                .Where(x => x.dto.Id > 0)
                .ToDictionary(x => x.dto.Id, x => x.task);

            foreach (var (task, dto) in tasksNeedingChildData)
            {
                if (dto.ParentId.HasValue && dto.ParentId.Value > 0)
                {
                    if (taskLookup.TryGetValue(dto.ParentId.Value, out var parentTask))
                    {
                         task.ParentId = parentTask.Id;
                    }
                    else 
                    {
                        // Maybe it refers to an existing task in DB? 
                        // For "Add" command, usually we add a batch.
                        // If not found in new batch, check DB if needed, or leave null for inference.
                         _logger.LogWarning("Parent ID {ParentId} not found in current batch for task {Title}", dto.ParentId, dto.Title);
                    }
                }
            }
        }

        private async Task InferParentChildRelationships(List<WBSTask> tasks)
        {
            _logger.LogInformation("AddWBSTaskCommandHandler: Inferring parent-child relationships based on task levels");

            var orderedTasks = tasks.OrderBy(t => t.DisplayOrder).ToList();
            Dictionary<WBSTaskLevel, WBSTask> latestTaskByLevel = new Dictionary<WBSTaskLevel, WBSTask>();

            foreach (var task in orderedTasks)
            {
                if (task.ParentId.HasValue)
                {
                    // Update latest task even if parent is already set, to support mixed explicit/implicit
                    latestTaskByLevel[task.Level] = task;
                    continue;
                }

                switch (task.Level)
                {
                    case WBSTaskLevel.Level1:
                        task.ParentId = null;
                        break;

                    case WBSTaskLevel.Level2:
                        if (latestTaskByLevel.TryGetValue(WBSTaskLevel.Level1, out var parentLevel1))
                        {
                            task.ParentId = parentLevel1.Id;
                        }
                        break;

                    case WBSTaskLevel.Level3:
                         if (latestTaskByLevel.TryGetValue(WBSTaskLevel.Level2, out var parentLevel2))
                        {
                            task.ParentId = parentLevel2.Id;
                        }
                        break;
                    default:
                         int previousLevel = (int)task.Level - 1;
                         if (previousLevel >= 1 && latestTaskByLevel.TryGetValue((WBSTaskLevel)previousLevel, out var parentTask))
                         {
                             task.ParentId = parentTask.Id;
                         }
                        break;
                }

                latestTaskByLevel[task.Level] = task;
            }
        }

        private async Task UpdateUserAssignment(WBSTask taskEntity, WBSTaskDto taskDto)
        {
            // Clear existing assignments to prevent duplicates
            taskEntity.UserWBSTasks.Clear();

             // Handle Manpower tasks
            if (taskEntity.TaskType == TaskType.Manpower)
            {
                bool shouldCreateUserWBSTask = taskEntity.Level == WBSTaskLevel.Level3 ||
                                               (!string.IsNullOrEmpty(taskDto.AssignedUserId) && taskDto.AssignedUserId != "string");

                if (shouldCreateUserWBSTask)
                {
                    string? actualUserId = (string.IsNullOrEmpty(taskDto.AssignedUserId) || taskDto.AssignedUserId == "string") ? null : taskDto.AssignedUserId;
                     // Fallback to name if it contains ID
                    if (string.IsNullOrEmpty(actualUserId) && !string.IsNullOrEmpty(taskDto.AssignedUserName) && taskDto.AssignedUserName != "string" && Guid.TryParse(taskDto.AssignedUserName, out _))
                    {
                        actualUserId = taskDto.AssignedUserName;
                    }

                    string? actualResourceRoleId = (string.IsNullOrEmpty(taskDto.ResourceRoleId) || taskDto.ResourceRoleId == "string") ? null : taskDto.ResourceRoleId;

                    if (!string.IsNullOrEmpty(actualUserId))
                    {
                         // Verify user exists if needed, or rely on FK constraint (if loose, skip check)
                         // To be safe and aligned with SetWBS:
                         // var userExists = await _context.Users.AnyAsync(u => u.Id == actualUserId);
                    }

                    var newUserTask = new UserWBSTask
                    {
                        WBSTask = taskEntity,
                        UserId = actualUserId,
                        Name = null,
                        CostRate = taskDto.CostRate,
                        Unit = taskDto.ResourceUnit,
                        TotalHours = taskEntity.PlannedHours.Sum(ph => ph.PlannedHours), // Will be loose initially, updated in UpdatePlannedHours
                        TotalCost = (decimal)taskEntity.PlannedHours.Sum(ph => ph.PlannedHours) * taskDto.CostRate,
                        CreatedAt = DateTime.UtcNow,
                        CreatedBy = _userContext.GetCurrentUserId() ?? _currentUser,
                        ResourceRoleId = actualResourceRoleId
                    };
                    taskEntity.UserWBSTasks.Add(newUserTask);
                }
            }
            // Handle ODC tasks
            else if (taskEntity.TaskType == TaskType.ODC)
            {
                if (!string.IsNullOrEmpty(taskDto.ResourceName))
                {
                    var newUserTask = new UserWBSTask
                    {
                        WBSTask = taskEntity,
                        UserId = null,
                        Name = taskDto.ResourceName,
                        CostRate = taskDto.CostRate,
                        Unit = taskDto.ResourceUnit,
                         TotalHours = taskEntity.PlannedHours.Sum(ph => ph.PlannedHours),
                        TotalCost = (decimal)taskEntity.PlannedHours.Sum(ph => ph.PlannedHours) * taskDto.CostRate,
                        CreatedAt = DateTime.UtcNow,
                        CreatedBy = _userContext.GetCurrentUserId() ?? _currentUser,
                        ResourceRoleId = taskDto.ResourceRoleId
                    };
                    taskEntity.UserWBSTasks.Add(newUserTask);
                }
            }
        }

        private async Task UpdatePlannedHours(WBSTask taskEntity, WBSTaskDto taskDto, string version, int projectId)
        {
            // Clear existing planned hours to prevent duplicates
            taskEntity.PlannedHours.Clear();
 
            // Ensure a WBSTaskPlannedHourHeader exists for this project and task type
            var plannedHourHeader = await _context.WBSTaskPlannedHourHeaders
                .Where(h => h.ProjectId == projectId && h.TaskType == taskEntity.TaskType)
                .OrderByDescending(h => h.Id)
                .FirstOrDefaultAsync();

            if (plannedHourHeader == null || plannedHourHeader.StatusId == (int)PMWorkflowStatusEnum.Approved)
            {
                plannedHourHeader = new WBSTaskPlannedHourHeader
                {
                    ProjectId = projectId,
                    CreatedAt = DateTime.UtcNow,
                    CreatedBy = _userContext.GetCurrentUserId() ?? _currentUser,
                    TaskType = taskEntity.TaskType,
                    StatusId = (int)PMWorkflowStatusEnum.Initial,
                    Version = version ?? "1.0"
                };
                _context.WBSTaskPlannedHourHeaders.Add(plannedHourHeader);
            }
            else 
            {
                // Update version for existing WIP header
                plannedHourHeader.Version = version ?? "1.0";
                _context.WBSTaskPlannedHourHeaders.Update(plannedHourHeader);
            }

            foreach (var phDto in taskDto.PlannedHours)
            {
                var newPh = new WBSTaskPlannedHour
                {
                    WBSTask = taskEntity,
                    WBSTaskPlannedHourHeader = plannedHourHeader,
                    Year = phDto.Year.ToString(),
                    Month = phDto.Month,
                    PlannedHours = phDto.PlannedHours,
                    CreatedAt = DateTime.UtcNow,
                    CreatedBy = _userContext.GetCurrentUserId() ?? _currentUser
                };
                taskEntity.PlannedHours.Add(newPh);
            }

            // Recalculate TotalHours/Cost on the UserWBSTask
            var userTask = taskEntity.UserWBSTasks.FirstOrDefault();
            if (userTask != null)
            {
                userTask.TotalHours = taskEntity.PlannedHours.Sum(ph => ph.PlannedHours);
                userTask.TotalCost = (decimal)taskEntity.PlannedHours.Sum(ph => ph.PlannedHours) * userTask.CostRate;
            }
        }

        private async Task CreateWBSVersionAfterUpdate(WBSHeader wbsHeader, Project project)
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

                // Initialize workflow history for the new version
                if (project != null)
                {
                    await InitializeVersionWorkflowHistoryAsync(wbsVersionHistory, project);
                    await _unitOfWork.SaveChangesAsync();
                }

                wbsHeader.LatestVersionHistoryId = wbsVersionHistory.Id;
                _context.WBSHeaders.Update(wbsHeader);
                await _unitOfWork.SaveChangesAsync();

                // Get all tasks to copy
                var uniqueTasks = await _context.WBSTasks
                    .Include(t => t.PlannedHours)
                    .Include(t => t.UserWBSTasks)
                    .Where(t => t.WorkBreakdownStructure.WBSHeaderId == wbsHeader.Id && !t.IsDeleted)
                    .ToListAsync();

                await CopyTasksToVersion(uniqueTasks, wbsVersionHistory.Id, wbsHeader.Version, wbsHeader.ProjectId);

                _logger.LogInformation($"Created WBS version history {nextVersionForEdit} for WBSHeader {wbsHeader.Id} after update (Add Task)");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error creating WBS version history for WBSHeader {wbsHeader.Id}");
            }
        }

        private async Task CopyTasksToVersion(List<WBSTask> tasks, int wbsVersionHistoryId, string version, int projectId)
        {
            var taskMap = new Dictionary<int, int>();

            foreach (var task in tasks.OrderBy(t => t.DisplayOrder))
            {
                var taskVersion = new WBSTaskVersionHistory
                {
                    TenantId = _context.TenantId ?? 0,
                    WBSVersionHistoryId = wbsVersionHistoryId,
                    OriginalTaskId = task.Id,
                    Level = task.Level,
                    Title = task.Title,
                    Description = task.Description,
                    DisplayOrder = task.DisplayOrder,
                    EstimatedBudget = task.EstimatedBudget,
                    StartDate = task.StartDate,
                    EndDate = task.EndDate,
                    TaskType = task.TaskType,
                    ParentId = task.ParentId,
                    WBSOptionId = task.WBSOptionId
                };

                await _wbsVersionRepository.CreateTaskVersionAsync(taskVersion);
                taskMap[task.Id] = taskVersion.Id;
            }

            foreach (var task in tasks)
            {
                var taskVersion = await _wbsVersionRepository.GetTaskVersionByIdAsync(taskMap[task.Id]);

                // Get the correct planned hour header for this task's type and version
                var plannedHourHeader = await _context.WBSTaskPlannedHourHeaders
                    .Where(h => h.ProjectId == projectId && h.TaskType == task.TaskType && h.Version == version)
                    .OrderByDescending(h => h.Id)
                    .FirstOrDefaultAsync();

                var hoursToCopy = task.PlannedHours;
                if (plannedHourHeader != null)
                {
                    hoursToCopy = task.PlannedHours
                        .Where(ph => ph.WBSTaskPlannedHourHeaderId == plannedHourHeader.Id)
                        .ToList();
                }

                foreach (var plannedHour in hoursToCopy)
                {
                    var plannedHourVersion = new WBSTaskPlannedHourVersionHistory
                    {
                        TenantId = _context.TenantId ?? 0,
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
                        TenantId = _context.TenantId ?? 0,
                        WBSTaskVersionHistoryId = taskVersion.Id,
                        UserId = userAssignment.UserId,
                        ResourceRoleId = userAssignment.ResourceRoleId,
                        CostRate = userAssignment.CostRate,
                        TotalHours = userAssignment.TotalHours,
                        TotalCost = userAssignment.TotalCost,
                        Name = userAssignment.Name,
                        Unit = userAssignment.Unit
                    };
                    await _wbsVersionRepository.CreateUserAssignmentVersionAsync(userAssignmentVersion);
                }
            }
        }

        private string CalculateNextVersion(string currentVersion, bool isApproved)
        {
            if (string.IsNullOrEmpty(currentVersion)) return "1.0";

            string versionStr = currentVersion.Trim();
            if (versionStr.StartsWith("v", StringComparison.OrdinalIgnoreCase))
            {
                versionStr = versionStr.Substring(1);
            }

            var parts = versionStr.Split('.');
            int major = 1;
            int minor = 0;

            if (parts.Length >= 1) int.TryParse(parts[0], out major);
            if (parts.Length >= 2) int.TryParse(parts[1], out minor);

            if (isApproved) return $"{major + 1}.0";
            else return $"{major}.{minor + 1}";
        }

        private async Task InitializeVersionWorkflowHistoryAsync(WBSVersionHistory versionHistory, Project project)
        {
            var userId = _userContext.GetCurrentUserId();
            var actionDate = DateTime.UtcNow;

            async Task AddWorkflowHistoryAsync(string assignedToId)
            {
                if (!string.IsNullOrEmpty(assignedToId))
                {
                    var assignedUserExists = await _context.Users.AnyAsync(u => u.Id == assignedToId);
                    if (assignedUserExists)
                    {
                        var history = new WBSVersionWorkflowHistory
                        {
                            WBSVersionHistoryId = versionHistory.Id,
                            StatusId = (int)PMWorkflowStatusEnum.Initial,
                            Action = "Initial",
                            Comments = "WBS status has been initialized",
                            ActionDate = actionDate,
                            ActionBy = userId,
                            AssignedToId = assignedToId,
                            TenantId = versionHistory.TenantId
                        };
                        _context.WBSVersionWorkflowHistories.Add(history);
                    }
                }
            }

            if (project != null)
            {
                await AddWorkflowHistoryAsync(project.ProjectManagerId);
                await AddWorkflowHistoryAsync(project.SeniorProjectManagerId);
                await AddWorkflowHistoryAsync(project.RegionalManagerId);
            }
        }
    }
}


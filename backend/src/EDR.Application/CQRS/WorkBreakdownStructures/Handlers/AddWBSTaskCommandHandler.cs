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
        private readonly string _currentUser = "System";

        public AddWBSTaskCommandHandler(
            ProjectManagementContext context,
            IUnitOfWork unitOfWork,
            ILogger<AddWBSTaskCommandHandler> logger,
            IWBSOptionRepository wbsOptionRepository,
            IUserContext userContext)
        {
            _context = context;
            _unitOfWork = unitOfWork;
            _logger = logger;
            _wbsOptionRepository = wbsOptionRepository;
            _userContext = userContext;
        }

        public async Task<WBSMasterDto> Handle(AddWBSTaskCommand request, CancellationToken cancellationToken)
        {
            _logger.LogInformation("Handling AddWBSTaskCommand for ProjectId {ProjectId}, TenantId {TenantId}",
                request.ProjectId, _context.TenantId);

            // 1. Find or create WBSHeader
            var wbsHeader = await FindOrCreateWBSHeader(request, cancellationToken);

            // 2. Process each WorkBreakdownStructure
            foreach (var wbsGroupDto in request.WBSMaster.WorkBreakdownStructures)
            {
                var wbsGroupEntity = await ProcessWorkBreakdownStructure(wbsHeader, wbsGroupDto, cancellationToken);
                
                // Save group first to ensure we have an ID
                await _unitOfWork.SaveChangesAsync();

                var allNewTasks = new List<WBSTask>();
                var tasksNeedingChildData = new List<(WBSTask task, WBSTaskDto dto)>();

                // 3. Upsert Tasks (First Pass - Basic Info)
                foreach (var taskDto in wbsGroupDto.Tasks)
                {
                    WBSTask taskEntity;
                    if (taskDto.Id > 0)
                    {
                        taskEntity = await _context.WBSTasks
                            .Include(t => t.UserWBSTasks)
                            .Include(t => t.PlannedHours)
                            .FirstOrDefaultAsync(t => t.Id == taskDto.Id, cancellationToken);

                        if (taskEntity != null)
                        {
                            // Update existing task
                            taskEntity.Title = taskDto.Title;
                            taskEntity.Description = taskDto.Description;
                            taskEntity.Level = taskDto.Level;
                            taskEntity.DisplayOrder = taskDto.DisplayOrder;
                            taskEntity.EstimatedBudget = taskDto.EstimatedBudget;
                            taskEntity.StartDate = taskDto.StartDate;
                            taskEntity.EndDate = taskDto.EndDate;
                            taskEntity.TaskType = taskDto.TaskType;
                            taskEntity.WBSOptionId = taskDto.WBSOptionId;
                            taskEntity.UpdatedAt = DateTime.UtcNow;
                            taskEntity.UpdatedBy = _userContext.GetCurrentUserId() ?? _currentUser;

                            _context.WBSTasks.Update(taskEntity);
                        }
                        else
                        {
                            // Task with ID not found, treat as new
                            taskEntity = await CreateWBSTaskBasic(taskDto, wbsGroupEntity, wbsHeader.TenantId, cancellationToken);
                            _context.WBSTasks.Add(taskEntity);
                        }
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
                    await UpdatePlannedHours(task, dto, request.ProjectId);
                }

                // 8. Final Save
                await _unitOfWork.SaveChangesAsync();
                
                // 9. Update DTOs with final IDs for response
                 foreach (var (task, dto) in tasksNeedingChildData)
                 {
                     dto.Id = task.Id;
                 }
            }

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
                        .ThenInclude(wbs => wbs.Tasks)
                    .FirstAsync(h => h.Id == request.WBSMaster.WbsHeaderId, cancellationToken);
                
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
                wbsHeader = new WBSHeader
                {
                    TenantId = _context.TenantId ?? 0, // IMPORTANT: Set TenantId
                    ProjectId = request.ProjectId,
                    Version = "1.0",
                    VersionDate = DateTime.UtcNow,
                    CreatedBy = _userContext.GetCurrentUserId() ?? _currentUser,
                    IsActive = true,
                    ApprovalStatus = PMWorkflowStatusEnum.Initial,
                    WorkBreakdownStructures = new List<WorkBreakdownStructure>()
                };
                _context.WBSHeaders.Add(wbsHeader);
                await _unitOfWork.SaveChangesAsync();
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
                wbsGroupEntity.TenantId = wbsHeader.TenantId; // Update TenantId
                _context.WorkBreakdownStructures.Update(wbsGroupEntity);
            }
            else
            {
                wbsGroupEntity = new WorkBreakdownStructure
                {
                    TenantId = wbsHeader.TenantId, // IMPORTANT: Set TenantId
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
                _logger.LogError("WBSOptionId is required for task.");
                throw new Exception("WBSOptionId is required for a task.");
            }

            if (string.IsNullOrEmpty(taskDto.Title))
            {
                _logger.LogError("Task Title is required.");
                throw new Exception("Task Title is required.");
            }

            // Create task entity
            var taskEntity = new WBSTask
            {
                TenantId = tenantId, // IMPORTANT: Set TenantId
                WorkBreakdownStructureId = wbsGroupEntity.Id,
                Description = taskDto.Description,
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

        private async Task UpdatePlannedHours(WBSTask taskEntity, WBSTaskDto taskDto, int projectId)
        {
            // Clear existing planned hours to prevent duplicates
            taskEntity.PlannedHours.Clear();

             // Ensure a WBSTaskPlannedHourHeader exists for this project and task type
            var plannedHourHeader = await _context.WBSTaskPlannedHourHeaders
                .FirstOrDefaultAsync(h => h.ProjectId == projectId && h.TaskType == taskEntity.TaskType);

            if (plannedHourHeader == null)
            {
                plannedHourHeader = new WBSTaskPlannedHourHeader
                {
                    ProjectId = projectId,
                    CreatedAt = DateTime.UtcNow,
                    CreatedBy = _userContext.GetCurrentUserId() ?? _currentUser,
                    TaskType = taskEntity.TaskType,
                    StatusId = (int)PMWorkflowStatusEnum.Initial,
                    Version = "1.0"
                };
                _context.WBSTaskPlannedHourHeaders.Add(plannedHourHeader);
                 // Save immediately to get ID if needed, or rely on EF Core fixup.
                 // Ideally header should be managed more carefully.
                 // For now, rely on context tracking.
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
    }
}


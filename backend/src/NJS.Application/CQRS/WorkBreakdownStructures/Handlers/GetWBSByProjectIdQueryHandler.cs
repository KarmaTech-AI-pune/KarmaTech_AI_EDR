using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using NJS.Application.CQRS.WorkBreakdownStructures.Queries;
using NJS.Application.Dtos;
using NJS.Domain.Database;
using NJS.Domain.Entities;
using NJS.Domain.Enums;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace NJS.Application.CQRS.WorkBreakdownStructures.Handlers
{
    public class GetWBSByProjectIdQueryHandler : IRequestHandler<GetWBSByProjectIdQuery, WBSMasterDto>
    {
        private readonly ProjectManagementContext _context;
        private readonly ILogger<GetWBSByProjectIdQueryHandler> _logger;

        public GetWBSByProjectIdQueryHandler(
            ProjectManagementContext context,
            ILogger<GetWBSByProjectIdQueryHandler> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<WBSMasterDto> Handle(GetWBSByProjectIdQuery request, CancellationToken cancellationToken)
        {
            _logger.LogInformation("Fetching WBS data for ProjectId: {ProjectId}", request.ProjectId);

            // First, check if project exists
            var projectExists = await _context.Projects
                .AnyAsync(p => p.Id == request.ProjectId, cancellationToken);

            if (!projectExists)
            {
                _logger.LogWarning("Project with ID {ProjectId} not found", request.ProjectId);
                return new WBSMasterDto
                {
                    WbsHeaderId = 0,
                    WorkBreakdownStructures = new List<WBSStructureMasterDto>()
                };
            }

            // Optimized data retrieval: Load all necessary data in single operations
            var wbsHeader = await _context.WBSHeaders
                .Where(h => h.ProjectId == request.ProjectId && h.IsActive)
                .AsNoTracking()
                .FirstOrDefaultAsync(cancellationToken);

            if (wbsHeader == null)
            {
                _logger.LogInformation("No active WBS found for ProjectId: {ProjectId}", request.ProjectId);
                return new WBSMasterDto
                {
                    WbsHeaderId = 0,
                    WorkBreakdownStructures = new List<WBSStructureMasterDto>()
                };
            }

            // Load all WBSTasks for the project with related data in optimized queries
            var wbsTasks = await _context.WBSTasks
                .Include(t => t.UserWBSTasks)
                    .ThenInclude(ut => ut.User)
                .Include(t => t.UserWBSTasks)
                    .ThenInclude(ut => ut.ResourceRole)
                .Include(t => t.PlannedHours)
                .Include(t => t.WBSOption)
                .Where(t => t.WorkBreakdownStructure.WBSHeader.ProjectId == request.ProjectId && 
                           !t.IsDeleted)
                .AsNoTracking()
                .ToListAsync(cancellationToken);

            // Load all WBSOptions for the tenant to build hierarchy
            var tenantId = await _context.Projects
                .Where(p => p.Id == request.ProjectId)
                .Select(p => p.TenantId)
                .FirstOrDefaultAsync(cancellationToken);

            var wbsOptions = await _context.WBSOptions
                .Where(o => o.TenantId == tenantId)
                .AsNoTracking()
                .ToDictionaryAsync(o => o.Id, cancellationToken);

            // Load WorkBreakdownStructures for the project
            var wbsStructures = await _context.WorkBreakdownStructures
                .Where(wbs => wbs.WBSHeader.ProjectId == request.ProjectId)
                .AsNoTracking()
                .ToListAsync(cancellationToken);

            // Create flat task DTOs with parent-child relationships indicated by WBSOptionId
            var taskDtos = BuildFlatTaskStructure(wbsTasks, wbsOptions);

            // Group tasks by their WorkBreakdownStructure
            var tasksByStructure = taskDtos
                .GroupBy(t => t.WorkBreakdownStructureId)
                .ToDictionary(g => g.Key, g => g.ToList());

            // Project to DTO with flat structure
            var wbsMasterDto = new WBSMasterDto
            {
                WbsHeaderId = wbsHeader.Id,
                WorkBreakdownStructures = wbsStructures
                    .OrderBy(wbs => wbs.DisplayOrder)
                    .Select(wbs => new WBSStructureMasterDto
                    {
                        WorkBreakdownStructureId = wbs.Id,
                        Name = wbs.Name,
                        Description = wbs.Description,
                        DisplayOrder = wbs.DisplayOrder,
                        Tasks = tasksByStructure.ContainsKey(wbs.Id) 
                            ? tasksByStructure[wbs.Id] // Include all tasks for this structure
                            : new List<WBSTaskDto>()
                    })
                    .ToList()
            };

            _logger.LogInformation(
                "Successfully fetched WBSHeader (Id: {WbsHeaderId}) with {WbsGroupCount} WBS groups and {TaskCount} tasks for ProjectId: {ProjectId}",
                wbsMasterDto.WbsHeaderId,
                wbsMasterDto.WorkBreakdownStructures.Count,
                taskDtos.Count,
                request.ProjectId);

            return wbsMasterDto;
        }

        /// <summary>
        /// Builds flat task structure with parent-child relationships indicated by WBSOption IDs
        /// </summary>
        private List<WBSTaskDto> BuildFlatTaskStructure(
            List<WBSTask> wbsTasks, 
            Dictionary<int, WBSOption> wbsOptions)
        {
            _logger.LogInformation("Building flat task structure from {TaskCount} tasks and {OptionCount} WBS options", 
                wbsTasks.Count, wbsOptions.Count);
                
            var taskDtos = new List<WBSTaskDto>();

            // Create all task DTOs with parent-child relationship info
            foreach (var task in wbsTasks)
            {
                var firstUserTask = task.UserWBSTasks.FirstOrDefault();
                var totalPlannedHours = task.PlannedHours.Sum(ph => ph.PlannedHours);
                
                // Get WBS Option details and label
                string title = task.Title;
                string optionLabel = null;
                int? parentWbsOptionId = null;
                
                // Get option details from the loaded option or directly from the task's WBSOption property
                if (task.WBSOption != null)
                {
                    title = task.WBSOption.Label ?? task.Title;
                    optionLabel = task.WBSOption.Label;
                    parentWbsOptionId = task.WBSOption.ParentId;
                }
                else if (wbsOptions.TryGetValue(task.WBSOptionId, out var option))
                {
                    title = option.Label ?? task.Title;
                    optionLabel = option.Label;
                    parentWbsOptionId = option.ParentId;
                }

                var taskDto = new WBSTaskDto
                {
                    Id = task.Id,
                    WorkBreakdownStructureId = task.WorkBreakdownStructureId,
                    Level = task.Level,
                    Title = title,
                    Description = task.Description,
                    DisplayOrder = task.DisplayOrder,
                    EstimatedBudget = task.EstimatedBudget,
                    StartDate = task.StartDate,
                    EndDate = task.EndDate,
                    TaskType = task.TaskType,
                    WBSOptionId = task.WBSOptionId,
                    WBSOptionLabel = optionLabel,

                    PlannedHours = task.PlannedHours.Select(ph => new PlannedHourDto
                    {
                        Year = int.Parse(ph.Year),
                        Month = ph.Month,
                        PlannedHours = ph.PlannedHours
                    }).ToList(),

                    // Resource/cost fields
                    CostRate = firstUserTask?.CostRate ?? 0,
                    ResourceUnit = firstUserTask?.Unit,
                    AssignedUserId = task.TaskType == TaskType.Manpower ? firstUserTask?.UserId : null,
                    AssignedUserName = task.TaskType == TaskType.Manpower ? firstUserTask?.User?.Name : null,
                    ResourceName = task.TaskType == TaskType.ODC ? firstUserTask?.Name : null,
                    ResourceRoleId = firstUserTask?.ResourceRoleId,
                    ResourceRoleName = firstUserTask?.ResourceRole?.Name,

                    TotalHours = task.TaskType == TaskType.ODC ? (firstUserTask?.TotalHours ?? 0) : totalPlannedHours,
                    TotalCost = task.TaskType == TaskType.ODC
                        ? (firstUserTask?.TotalCost ?? 0)
                        : (decimal)totalPlannedHours * (firstUserTask?.CostRate ?? 0),
                    
                    // Keep empty children list instead of null for backward compatibility
                    Children = new List<WBSTaskDto>()
                };

                taskDtos.Add(taskDto);
            }

            _logger.LogDebug("Created {Count} flat task DTOs", taskDtos.Count);
            
            // Build a dictionary mapping WBSOptionIds to their parent ids for the frontend to use
            var optionParentMapping = wbsOptions
                .Where(o => o.Value.ParentId.HasValue)
                .ToDictionary(o => o.Key, o => o.Value.ParentId.Value);
            
            _logger.LogDebug("Parent-child mappings in WBSOptions: {Count}", optionParentMapping.Count);
            
            return taskDtos;
        }
    }
}

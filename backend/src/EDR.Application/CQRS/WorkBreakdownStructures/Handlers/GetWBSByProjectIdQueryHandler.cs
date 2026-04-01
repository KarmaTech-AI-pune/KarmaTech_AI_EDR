using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using EDR.Application.CQRS.WorkBreakdownStructures.Queries;
using EDR.Application.Dtos;
using EDR.Domain.Database;
using EDR.Domain.Entities;
using EDR.Domain.Enums;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace EDR.Application.CQRS.WorkBreakdownStructures.Handlers
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
                .OrderByDescending(h => h.Id)
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

            // Load all WBSTasks for the project with related data in optimized queries for the SPECIFIC header
            var wbsTasks = await _context.WBSTasks
                .Include(t => t.UserWBSTasks)
                    .ThenInclude(ut => ut.User)
                .Include(t => t.UserWBSTasks)
                    .ThenInclude(ut => ut.ResourceRole)
                .Include(t => t.PlannedHours)
                .Include(t => t.WBSOption)
                .Where(t => t.WorkBreakdownStructure.WBSHeaderId == wbsHeader.Id && 
                           !t.IsDeleted)
                .AsNoTracking()
                .ToListAsync(cancellationToken);

            // Load all WBSOptions for the tenant to build hierarchy
            var tenantId = projectExists ? await _context.Projects
                .Where(p => p.Id == request.ProjectId)
                .Select(p => p.TenantId)
                .FirstOrDefaultAsync(cancellationToken) : 0;

            var wbsOptions = await _context.WBSOptions
                .Where(o => o.TenantId == tenantId)
                .AsNoTracking()
                .ToDictionaryAsync(o => o.Id, cancellationToken);

            // Load WorkBreakdownStructures for the SPECIFIC header
            var wbsStructures = await _context.WorkBreakdownStructures
                .Where(wbs => wbs.WBSHeaderId == wbsHeader.Id)
                .AsNoTracking()
                .ToListAsync(cancellationToken);

            // Build in-memory hierarchy using WBSOption relationships
            // Use GroupBy + ToDictionary with First() to handle potential duplicate WBSOptionIds
            var tasksByWbsOptionId = wbsTasks
                .GroupBy(t => t.WBSOptionId)
                .ToDictionary(g => g.Key, g => g.First());
            var taskDtos = wbsTasks.Select(task => new WBSTaskDto
            {
                Id = task.Id,
                WorkBreakdownStructureId = task.WorkBreakdownStructureId,
                Level = task.Level,
                Title = task.WBSOption != null ? task.WBSOption.Label : task.Title,
                Description = task.Description,
                DisplayOrder = task.DisplayOrder,
                EstimatedBudget = task.EstimatedBudget,
                StartDate = task.StartDate,
                EndDate = task.EndDate,
                TaskType = task.TaskType,
                WBSOptionId = task.WBSOptionId,
                WBSOptionLabel = task.WBSOption?.Label,
                PlannedHours = task.PlannedHours.Select(ph => new PlannedHourDto
                {
                    Year = int.Parse(ph.Year),
                    Month = ph.Month,
                    PlannedHours = ph.PlannedHours
                }).ToList(),
                CostRate = task.UserWBSTasks.FirstOrDefault()?.CostRate ?? 0,
                ResourceUnit = task.UserWBSTasks.FirstOrDefault()?.Unit,
                AssignedUserId = task.TaskType == TaskType.Manpower ? task.UserWBSTasks.FirstOrDefault()?.UserId : null,
                AssignedUserName = task.TaskType == TaskType.Manpower ? task.UserWBSTasks.FirstOrDefault()?.User?.Name : null,
                ResourceName = task.TaskType == TaskType.ODC ? task.UserWBSTasks.FirstOrDefault()?.Name : null,
                ResourceRoleId = task.UserWBSTasks.FirstOrDefault()?.ResourceRoleId,
                ResourceRoleName = task.UserWBSTasks.FirstOrDefault()?.ResourceRole?.Name,
                TotalHours = task.TaskType == TaskType.ODC ? (task.UserWBSTasks.FirstOrDefault()?.TotalHours ?? 0) : task.PlannedHours.Sum(ph => ph.PlannedHours),
                TotalCost = task.TaskType == TaskType.ODC
                    ? (task.UserWBSTasks.FirstOrDefault()?.TotalCost ?? 0)
                    : (decimal)task.PlannedHours.Sum(ph => ph.PlannedHours) * (task.UserWBSTasks.FirstOrDefault()?.CostRate ?? 0),
                ParentId = task.ParentId ?? (task.WBSOption != null && task.WBSOption.ParentId.HasValue && tasksByWbsOptionId.ContainsKey(task.WBSOption.ParentId.Value) ? (int?)tasksByWbsOptionId[task.WBSOption.ParentId.Value].Id : null)
            }).ToList();

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
                            ? tasksByStructure[wbs.Id].ToList()
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
    }
}


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

            // Fetch the WBSHeader with all WorkBreakdownStructures and related data
            var wbsHeader = await _context.WBSHeaders
                .Include(h => h.WorkBreakdownStructures)
                    .ThenInclude(wbs => wbs.Tasks.Where(t => !t.IsDeleted))
                        .ThenInclude(t => t.UserWBSTasks)
                            .ThenInclude(ut => ut.User)
                .Include(h => h.WorkBreakdownStructures)
                    .ThenInclude(wbs => wbs.Tasks.Where(t => !t.IsDeleted))
                        .ThenInclude(t => t.UserWBSTasks)
                            .ThenInclude(ut => ut.ResourceRole)
                .Include(h => h.WorkBreakdownStructures)
                    .ThenInclude(wbs => wbs.Tasks.Where(t => !t.IsDeleted))
                        .ThenInclude(t => t.PlannedHours)
                .Include(h => h.WorkBreakdownStructures)
                    .ThenInclude(wbs => wbs.Tasks.Where(t => !t.IsDeleted))
                        .ThenInclude(t => t.WBSOption)
                .Where(h => h.ProjectId == request.ProjectId && h.IsActive)
                .AsNoTracking()
                .AsSplitQuery()
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

            // Project to DTO in memory - Map all WorkBreakdownStructures to WBSMasterDto
            var wbsMasterDto = new WBSMasterDto
            {
                WbsHeaderId = wbsHeader.Id,
                WorkBreakdownStructures = wbsHeader.WorkBreakdownStructures
                    .OrderBy(wbs => wbs.DisplayOrder)
                    .Select(wbs => new WBSStructureMasterDto
                    {
                        WorkBreakdownStructureId = wbs.Id,
                        Name = wbs.Name,
                        Description = wbs.Description,
                        DisplayOrder = wbs.DisplayOrder,
                        Tasks = wbs.Tasks
                            .Where(t => !t.IsDeleted)
                            .OrderBy(t => t.DisplayOrder)
                            .Select(t =>
                            {
                                var firstUserTask = t.UserWBSTasks.FirstOrDefault();
                                var totalPlannedHours = t.PlannedHours.Sum(ph => ph.PlannedHours);

                                return new WBSTaskDto
                                {
                                    Id = t.Id,
                                    WorkBreakdownStructureId = t.WorkBreakdownStructureId,
                                    ParentId = t.ParentId,
                                    Level = t.Level,
                                    Title = t.WBSOption != null ? t.WBSOption.Label : t.Title,
                                    Description = t.Description,
                                    DisplayOrder = t.DisplayOrder,
                                    EstimatedBudget = t.EstimatedBudget,
                                    StartDate = t.StartDate,
                                    EndDate = t.EndDate,
                                    TaskType = t.TaskType,
                                    WBSOptionId = t.WBSOptionId,
                                    WBSOptionLabel = t.WBSOption?.Label,

                                    PlannedHours = t.PlannedHours.Select(ph => new PlannedHourDto
                                    {
                                        Year = int.Parse(ph.Year),
                                        Month = ph.Month,
                                        PlannedHours = ph.PlannedHours
                                    }).ToList(),

                                    // Resource/cost fields
                                    CostRate = firstUserTask?.CostRate ?? 0,
                                    ResourceUnit = firstUserTask?.Unit,
                                    AssignedUserId = t.TaskType == TaskType.Manpower ? firstUserTask?.UserId : null,
                                    AssignedUserName = t.TaskType == TaskType.Manpower ? firstUserTask?.User?.Name : null,
                                    ResourceName = t.TaskType == TaskType.ODC ? firstUserTask?.Name : null,
                                    ResourceRoleId = firstUserTask?.ResourceRoleId,
                                    ResourceRoleName = firstUserTask?.ResourceRole?.Name,

                                    TotalHours = t.TaskType == TaskType.ODC ? (firstUserTask?.TotalHours ?? 0) : totalPlannedHours,
                                    TotalCost = t.TaskType == TaskType.ODC
                                        ? (firstUserTask?.TotalCost ?? 0)
                                        : (decimal)totalPlannedHours * (firstUserTask?.CostRate ?? 0)
                                };
                            })
                            .ToList()
                    })
                    .ToList()
            };

            _logger.LogInformation(
                "Successfully fetched WBSHeader (Id: {WbsHeaderId}) with {WbsGroupCount} WBS groups for ProjectId: {ProjectId}",
                wbsMasterDto.WbsHeaderId,
                wbsMasterDto.WorkBreakdownStructures.Count,
                request.ProjectId);

            return wbsMasterDto;
        }
    }
}

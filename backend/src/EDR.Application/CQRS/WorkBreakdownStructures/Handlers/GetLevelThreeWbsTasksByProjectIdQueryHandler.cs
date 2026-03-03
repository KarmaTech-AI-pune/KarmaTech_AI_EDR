using MediatR;
using Microsoft.EntityFrameworkCore;
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
    public class GetLevelThreeWbsTasksByProjectIdQueryHandler : IRequestHandler<GetLevelThreeWbsTasksByProjectIdQuery, List<WBSTaskDto>>
    {
        private readonly ProjectManagementContext _context;

        public GetLevelThreeWbsTasksByProjectIdQueryHandler(ProjectManagementContext context)
        {
            _context = context;
        }

        public async Task<List<WBSTaskDto>> Handle(GetLevelThreeWbsTasksByProjectIdQuery request, CancellationToken cancellationToken)
        {
            var wbsTasks = await _context.WBSTasks
                .Include(t => t.WorkBreakdownStructure)
                    .ThenInclude(wbs => wbs.WBSHeader)
                .Include(t => t.UserWBSTasks)
                    .ThenInclude(ut => ut.User)
                .Include(t => t.UserWBSTasks)
                    .ThenInclude(ut => ut.ResourceRole)
                .Include(t => t.PlannedHours)
                .Where(t => t.WorkBreakdownStructure.WBSHeader.ProjectId == request.ProjectId 
                            && t.WorkBreakdownStructure.WBSHeader.IsActive 
                            && !t.IsDeleted
                            && t.Level == WBSTaskLevel.Level3)
                .ToListAsync(cancellationToken);

            return ConvertToHierarchicalDto(wbsTasks);
        }

        private List<WBSTaskDto> ConvertToHierarchicalDto(List<WBSTask> tasks)
        {
            var wbsOptions = _context.WBSOptions.ToList();

            var taskDtos = tasks.Select(t => {
                string displayTitle = t.Title;
                if (t.WBSOptionId > 0)
                {
                    var wbsOption = wbsOptions.FirstOrDefault(o => o.Id == t.WBSOptionId);
                    if (wbsOption != null)
                    {
                        displayTitle = wbsOption.Label;
                    }
                }

                return new WBSTaskDto
                {
                    Id = t.Id,
                    WorkBreakdownStructureId = t.WorkBreakdownStructureId,
                    Title = displayTitle,
                    Description = t.Description,
                    Level = (WBSTaskLevel)t.Level,
                    StartDate = t.StartDate,
                    EndDate = t.EndDate,
                    TaskType = t.TaskType,
                    WBSOptionId = t.WBSOptionId,
                    WBSOptionLabel = t.WBSOption?.Label,

                    AssignedUserId = t.TaskType == TaskType.Manpower ? t.UserWBSTasks?.FirstOrDefault()?.UserId : null,
                    AssignedUserName = t.TaskType == TaskType.Manpower ? t.UserWBSTasks?.FirstOrDefault()?.User?.Name : null,

                    ResourceName = t.TaskType == TaskType.ODC ? t.UserWBSTasks?.FirstOrDefault()?.Name : null,
                    ResourceUnit = t.UserWBSTasks?.FirstOrDefault()?.Unit,
                    ResourceRoleId = t.UserWBSTasks?.FirstOrDefault()?.ResourceRole?.Id ?? string.Empty,
                    ResourceRoleName = t.UserWBSTasks?.FirstOrDefault()?.ResourceRole?.Name ?? string.Empty,

                    CostRate = t.UserWBSTasks?.FirstOrDefault()?.CostRate ?? 0,
                    TotalHours = t.UserWBSTasks?.FirstOrDefault()?.TotalHours ?? 0,
                    TotalCost = t.UserWBSTasks?.FirstOrDefault()?.TotalCost ?? 0,
                    PlannedHours = t.PlannedHours?.Select(ph => new PlannedHourDto
                    {
                        Year = int.Parse(ph.Year),
                        Month = ph.Month,
                        PlannedHours = ph.PlannedHours
                    }).ToList() ?? new List<PlannedHourDto>(),
                    DisplayOrder = t.DisplayOrder
                };
            }).ToList();

            return taskDtos;
        }
    }
}

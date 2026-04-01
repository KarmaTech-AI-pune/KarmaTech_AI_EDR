using MediatR;
using Microsoft.EntityFrameworkCore;
using EDR.Domain.Database;
using EDR.Domain.Entities;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace EDR.Application.CQRS.SprintWbsPlans.Queries
{
    public class GetSprintWbsPlansByProjectQueryHandler : IRequestHandler<GetSprintWbsPlansByProjectQuery, List<SprintWbsPlan>>
    {
        private readonly ProjectManagementContext _context;

        public GetSprintWbsPlansByProjectQueryHandler(ProjectManagementContext context)
        {
            _context = context;
        }

        public async Task<List<SprintWbsPlan>> Handle(GetSprintWbsPlansByProjectQuery request, CancellationToken cancellationToken)
        {
            var maxVersion = await _context.SprintWbsPlans
                .Where(x => x.ProjectId == request.ProjectId)
                .Select(x => (int?)x.BacklogVersion)
                .MaxAsync(cancellationToken) ?? 0;

            if (maxVersion == 0) return new List<SprintWbsPlan>();

            var plans = await _context.SprintWbsPlans
                .Where(x => x.ProjectId == request.ProjectId && x.BacklogVersion == maxVersion)
                .ToListAsync(cancellationToken);

            // Carryover Logic (Persistent): 
            // 1. Group by WBSTaskId
            // 2. Sort group chronologically (MonthYear, SprintNumber)
            // 3. For each sprint, if previous has RemainingHours > 0, carry over and zero out previous.
            
            bool anyChanged = false;
            var groupedPlans = plans.Where(p => p.WBSTaskId.HasValue)
                                    .GroupBy(p => p.WBSTaskId.Value);

            foreach (var group in groupedPlans)
            {
                var sortedPlans = group.Select(p => new
                {
                    Plan = p,
                    ParsedDate = ParseMonthYear(p.MonthYear)
                })
                .OrderBy(x => x.ParsedDate)
                .ThenBy(x => x.Plan.SprintNumber)
                .ToList();

                for (int i = 1; i < sortedPlans.Count; i++)
                {
                    var prev = sortedPlans[i - 1].Plan;
                    var curr = sortedPlans[i].Plan;

                    // Logic: Carryover must only run when a valid previous sprint exists
                    // and only if the previous sprint has been worked on (consumed).
                    // This ensures the first sprint always keeps its planned hours 
                    // and prevents incorrectly setting hours to 0 before work is logged.
                    if (prev != null && prev.IsConsumed && prev.RemainingHours > 0 && !curr.IsCarryoverApplied)
                    {
                        curr.PlannedHours += prev.RemainingHours;
                        curr.RemainingHours += prev.RemainingHours;
                        prev.RemainingHours = 0;
                        curr.IsCarryoverApplied = true;
                        anyChanged = true;
                    }
                }
            }

            if (anyChanged)
            {
                await _context.SaveChangesAsync(cancellationToken);
            }

            return plans.OrderBy(x => x.ProgramSequence).ToList();
        }

        private DateTime ParseMonthYear(string my)
        {
            if (string.IsNullOrWhiteSpace(my)) return DateTime.MaxValue;
            if (DateTime.TryParseExact(my, "MM-yyyy", null, System.Globalization.DateTimeStyles.None, out var date))
                return date;
            return DateTime.MaxValue;
        }
    }
}


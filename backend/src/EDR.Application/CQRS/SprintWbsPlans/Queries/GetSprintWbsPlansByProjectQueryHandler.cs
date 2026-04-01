using System;
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
                                    .GroupBy(p => new { p.ProjectId, p.WBSTaskId });

            foreach (var group in groupedPlans)
            {
                var orderedPlans = group
                    .OrderBy(x => int.Parse(x.MonthYear.Split('-')[1])) // Year
                    .ThenBy(x => int.Parse(x.MonthYear.Split('-')[0])) // Month
                    .ThenBy(x => x.SprintNumber)
                    .ToList();

                for (int i = 0; i < orderedPlans.Count; i++)
                {
                    var currentSprint = orderedPlans[i];
                    var previousSprint = i > 0 ? orderedPlans[i - 1] : null;

                    if (previousSprint != null 
                        && previousSprint.RemainingHours > 0 
                        && !currentSprint.IsCarryoverApplied)
                    {
                        currentSprint.PlannedHours += previousSprint.RemainingHours;
                        currentSprint.RemainingHours += previousSprint.RemainingHours;

                        currentSprint.IsCarryoverApplied = true;
                        anyChanged = true;
                    }

                    Console.WriteLine($"Project: {currentSprint.ProjectId}, Task: {currentSprint.WBSTaskId}, Sprint: {currentSprint.SprintNumber}, Remaining: {currentSprint.RemainingHours}");
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


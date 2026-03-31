using MediatR;
using Microsoft.EntityFrameworkCore;
using EDR.Application.Dtos;
using EDR.Domain.Database;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace EDR.Application.CQRS.SprintWbsPlans.Queries
{
    public class GetCurrentSprintWbsPlanQueryHandler : IRequestHandler<GetCurrentSprintWbsPlanQuery, CurrentSprintWbsPlanResponseDto>
    {
        private readonly ProjectManagementContext _context;

        public GetCurrentSprintWbsPlanQueryHandler(ProjectManagementContext context)
        {
            _context = context;
        }

        public async Task<CurrentSprintWbsPlanResponseDto> Handle(GetCurrentSprintWbsPlanQuery request, CancellationToken cancellationToken)
        {
            // 1. Fetch Project Information (Basic)
            var project = await _context.Projects
                .Where(p => p.Id == request.ProjectId)
                .Select(p => new WbsProjectDto
                {
                    ProjectId = p.Id,
                    ProjectName = p.Name,
                    StartDate = p.StartDate,
                    EndDate = p.EndDate,
                    SprintDurationDays = 14 // Logic: Default 14 days as not in DB
                })
                .FirstOrDefaultAsync(cancellationToken);

            if (project == null) return null;

            // 2. Fetch Latest Backlog Version for this project
            var maxVersion = await _context.SprintWbsPlans
                .Where(x => x.ProjectId == request.ProjectId)
                .Select(x => (int?)x.BacklogVersion)
                .MaxAsync(cancellationToken) ?? 0;

            if (maxVersion == 0) return null;

            // 3. Fetch Unconsumed SprintWbsPlans for this project and only for the latest version
            var unconsumedPlans = await _context.SprintWbsPlans
                .Where(x => x.ProjectId == request.ProjectId && !x.IsConsumed && x.BacklogVersion == maxVersion)
                .ToListAsync(cancellationToken);

            if (!unconsumedPlans.Any())
            {
                // No unconsumed plans found
                return null;
            }

            // 3. Sort and Identify Next Pending Sprint
            // Sort by MonthYear (Date parsed) -> then SprintNumber
            var nextBatch = unconsumedPlans
                .Select(p => new
                {
                    Plan = p,
                    ParsedDate = ParseMonthYear(p.MonthYear)
                })
                .OrderBy(x => x.ParsedDate)
                .ThenBy(x => x.Plan.SprintNumber)
                .GroupBy(x => new { x.Plan.MonthYear, x.Plan.SprintNumber })
                .FirstOrDefault();

            if (nextBatch == null) return null;

            var targetMonth = nextBatch.Key.MonthYear;
            var targetSprint = nextBatch.Key.SprintNumber;
            var parsedTargetDate = nextBatch.FirstOrDefault()?.ParsedDate ?? DateTime.MaxValue;

            // 4. Extract Plans for that specific batch
            var currentPlans = nextBatch.Select(x => x.Plan)
                                        .OrderBy(x => x.ProgramSequence)
                                        .ToList();

            // 5. Carryover Logic (Persistent)
            // For each task in the current batch, find its IMMEDIATE previous sprint in the same version.
            var wbsTaskIds = currentPlans.Where(p => p.WBSTaskId.HasValue)
                                         .Select(p => p.WBSTaskId.Value)
                                         .Distinct()
                                         .ToList();

            if (wbsTaskIds.Any())
            {
                // Fetch ALL sprints for these tasks in the same backlog version to find "immediate previous"
                var allSprintsForTasks = await _context.SprintWbsPlans
                    .Where(x => x.ProjectId == request.ProjectId && 
                                x.BacklogVersion == maxVersion && 
                                x.WBSTaskId.HasValue && 
                                wbsTaskIds.Contains(x.WBSTaskId.Value))
                    .ToListAsync(cancellationToken);

                bool anyChanged = false;
                var groupedSprints = allSprintsForTasks.GroupBy(p => new { p.ProjectId, p.WBSTaskId });

                foreach (var group in groupedSprints)
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
            }

            // 6. Construct Response
            return new CurrentSprintWbsPlanResponseDto
            {
                Project = project,
                Sprint = new WbsSprintContextDto
                {
                    MonthYear = targetMonth,
                    SprintNumber = targetSprint
                },
                WbsPlans = currentPlans.Select(p => new WbsPlanDto
                {
                    SprintWbsPlanId = p.SprintWbsPlanId,
                    WbsTaskId = p.WBSTaskId,
                    WbsTaskName = p.WBSTaskName,
                    AssignedUserName = p.AssignedUserName,
                    RoleName = p.RoleName,
                    PlannedHours = p.PlannedHours,
                    RemainingHours = p.RemainingHours,
                    ProgramSequence = p.ProgramSequence,
                    IsConsumed = p.IsConsumed,
                    AcceptanceCriteria = p.AcceptanceCriteria,
                    TaskDescription = p.TaskDescription
                }).ToList()
            };
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


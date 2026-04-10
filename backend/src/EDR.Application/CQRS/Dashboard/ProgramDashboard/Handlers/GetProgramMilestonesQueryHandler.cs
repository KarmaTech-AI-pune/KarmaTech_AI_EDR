using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDR.Application.CQRS.Dashboard.ProgramDashboard.Queries;
using EDR.Application.Dtos.ProgramDashboard;
using EDR.Repositories.Interfaces;

namespace EDR.Application.CQRS.Dashboard.ProgramDashboard.Handlers
{
    public class GetProgramMilestonesQueryHandler : IRequestHandler<GetProgramMilestonesQuery, List<MilestoneBillingDto>>
    {
        private readonly IProgramDashboardRepository _programDashboardRepository;

        public GetProgramMilestonesQueryHandler(IProgramDashboardRepository programDashboardRepository)
        {
            _programDashboardRepository = programDashboardRepository;
        }

        public async Task<List<MilestoneBillingDto>> Handle(GetProgramMilestonesQuery request, CancellationToken cancellationToken)
        {
            var projects = await _programDashboardRepository.GetProjectsByProgramIdAsync(request.ProgramId, cancellationToken);
            if (!projects.Any()) return new List<MilestoneBillingDto>();

            var projectIds = projects.Select(p => p.Id).ToList();
            var projectNames = projects.ToDictionary(p => p.Id, p => p.Name);

            var progressReports = await _programDashboardRepository.GetMonthlyProgressesByProjectIdsAsync(projectIds, cancellationToken);
            
            // Get latest progress report for each project that has progress deliverables
            var latestReports = progressReports
                .GroupBy(mp => mp.ProjectId)
                .Select(g => g.OrderByDescending(mp => mp.Year).ThenByDescending(mp => mp.Month).FirstOrDefault())
                .Where(mp => mp?.ProgressDeliverables != null && mp.ProgressDeliverables.Any())
                .ToList();

            var milestones = new List<MilestoneBillingDto>();
            foreach (var report in latestReports)
            {
                var projectName = projectNames.GetValueOrDefault(report.ProjectId, "Unknown");
                milestones.AddRange(report.ProgressDeliverables.Select(d => new MilestoneBillingDto
                {
                    Id = d.Id,
                    Project = projectName,
                    Milestone = d.Milestone ?? "Deliverable",
                    ExpectedAmount = d.PaymentDue ?? 0,
                    Status = d.PaymentReceivedDate.HasValue ? "Completed" : (d.DueDateContract < DateTime.UtcNow ? "Overdue" : "On Track"),
                    DaysDelayed = d.PaymentReceivedDate.HasValue && d.DueDateContract.HasValue 
                        ? (d.PaymentReceivedDate.Value - d.DueDateContract.Value).Days 
                        : (d.DueDateContract < DateTime.UtcNow ? (int)(DateTime.UtcNow - (d.DueDateContract ?? DateTime.UtcNow)).TotalDays : 0),
                    Penalty = 0
                }));
            }

            return milestones;
        }
    }
}

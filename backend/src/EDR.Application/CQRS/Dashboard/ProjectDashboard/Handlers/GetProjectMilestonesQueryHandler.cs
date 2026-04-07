using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDR.Application.CQRS.Dashboard.ProjectDashboard.Queries;
using EDR.Application.Dtos.ProjectDashboard;
using EDR.Repositories.Interfaces;

namespace EDR.Application.CQRS.Dashboard.ProjectDashboard.Handlers
{
    public class GetProjectMilestonesQueryHandler : IRequestHandler<GetProjectMilestonesQuery, List<MilestoneBillingDto>>
    {
        private readonly IProjectDashboardRepository _projectDashboardRepository;

        public GetProjectMilestonesQueryHandler(IProjectDashboardRepository projectDashboardRepository)
        {
            _projectDashboardRepository = projectDashboardRepository;
        }

        public async Task<List<MilestoneBillingDto>> Handle(GetProjectMilestonesQuery request, CancellationToken cancellationToken)
        {
            var project = await _projectDashboardRepository.GetProjectByIdAsync(request.ProjectId, cancellationToken);
            if (project == null) return new List<MilestoneBillingDto>();

            var progressReports = await _projectDashboardRepository.GetMonthlyProgressesByProjectIdAsync(request.ProjectId, cancellationToken);
            
            var latestMonthlyProgress = progressReports
                .OrderByDescending(mp => mp.Year).ThenByDescending(mp => mp.Month)
                .FirstOrDefault();

            if (latestMonthlyProgress?.ProgressDeliverables == null) return new List<MilestoneBillingDto>();

            return latestMonthlyProgress.ProgressDeliverables.Select(d => new MilestoneBillingDto
            {
                Id = d.Id,
                Project = project.Name,
                Milestone = d.Milestone ?? "Deliverable",
                ExpectedAmount = d.PaymentDue ?? 0,
                Status = d.PaymentReceivedDate.HasValue ? "Completed" : (d.DueDateContract < DateTime.UtcNow ? "Overdue" : "On Track"),
                DaysDelayed = d.PaymentReceivedDate.HasValue && d.DueDateContract.HasValue 
                    ? (d.PaymentReceivedDate.Value - d.DueDateContract.Value).Days 
                    : (d.DueDateContract < DateTime.UtcNow ? (int)(DateTime.UtcNow - (d.DueDateContract ?? DateTime.UtcNow)).TotalDays : 0),
                Penalty = 0
            }).ToList();
        }
    }
}

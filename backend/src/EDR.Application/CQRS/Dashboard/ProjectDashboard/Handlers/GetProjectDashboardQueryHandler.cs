using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDR.Application.CQRS.Dashboard.ProjectDashboard.Queries;
using EDR.Application.Dtos.ProjectDashboard;
using EDR.Repositories.Interfaces;

namespace EDR.Application.CQRS.Dashboard.ProjectDashboard.Handlers
{
    public class GetProjectDashboardQueryHandler : IRequestHandler<GetProjectDashboardQuery, ProjectDashboardDto>
    {
        private readonly IMediator _mediator;
        private readonly IProjectDashboardRepository _projectDashboardRepository;

        public GetProjectDashboardQueryHandler(IMediator mediator, IProjectDashboardRepository projectDashboardRepository)
        {
            _mediator = mediator;
            _projectDashboardRepository = projectDashboardRepository;
        }

        public async Task<ProjectDashboardDto> Handle(GetProjectDashboardQuery request, CancellationToken cancellationToken)
        {
            var project = await _projectDashboardRepository.GetProjectByIdAsync(request.ProjectId, cancellationToken);
            if (project == null) return null;

            // Aggregate data from granular handlers
            var totalRevenueActual = await _mediator.Send(new GetProjectTotalRevenueActualQuery { ProjectId = request.ProjectId }, cancellationToken);
            var totalRevenueExpected = await _mediator.Send(new GetProjectTotalRevenueExpectedQuery { ProjectId = request.ProjectId }, cancellationToken);
            var profit = await _mediator.Send(new GetProjectProfitMarginQuery { ProjectId = request.ProjectId }, cancellationToken);
            var npv = await _mediator.Send(new GetProjectNpvQuery { ProjectId = request.ProjectId }, cancellationToken);
            var pendingForms = await _mediator.Send(new GetProjectPendingFormsQuery { ProjectId = request.ProjectId }, cancellationToken);
            var milestones = await _mediator.Send(new GetProjectMilestonesQuery { ProjectId = request.ProjectId }, cancellationToken);
            var cashflow = await _mediator.Send(new GetProjectMonthlyCashflowQuery { ProjectId = request.ProjectId }, cancellationToken);
            var taskMatrix = await _mediator.Send(new GetProjectTaskPriorityMatrixQuery { ProjectId = request.ProjectId }, cancellationToken);
            var atRisk = await _mediator.Send(new GetProjectAtRiskQuery { ProjectId = request.ProjectId }, cancellationToken);
            var portfolio = await _mediator.Send(new GetProjectRegionalPortfolioQuery { ProjectId = request.ProjectId }, cancellationToken);

            return new ProjectDashboardDto
            {
                ProjectId = project.Id,
                ProjectName = project.Name,
                Currency = project.Currency ?? "USD",
                
                // Revenue (Actual)
                TotalRevenueActual = totalRevenueActual.TotalRevenue,
                RevenueChangeDescription = totalRevenueActual.ChangeDescription,
                RevenueChangeType = totalRevenueActual.ChangeType,

                // Revenue (Expected)
                TotalRevenueExpected = totalRevenueExpected.TotalRevenue,

                // Profit
                ProfitMargin = profit.ProfitMargin,
                ProfitMarginChangeDescription = profit.ProfitMarginChangeDescription,
                ProfitMarginChangeType = profit.ProfitMarginChangeType,

                // NPV
                CurrentNpv = npv.CurrentNpv,
                WhatIfAnalysis = npv.WhatIfAnalysis,


                // Collections
                PendingForms = pendingForms,
                Milestones = milestones,
                MonthlyCashflow = cashflow,
                TaskPriorityMatrix = taskMatrix,
                ProjectsAtRisk = atRisk,
                RegionalPortfolio = portfolio
            };
        }
    }
}

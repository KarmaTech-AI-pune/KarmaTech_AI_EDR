using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDR.Application.CQRS.Dashboard.ProgramDashboard.Queries;
using EDR.Application.Dtos.ProgramDashboard;
using EDR.Repositories.Interfaces;

namespace EDR.Application.CQRS.Dashboard.ProgramDashboard.Handlers
{
    public class GetProgramDashboardQueryHandler : IRequestHandler<GetProgramDashboardQuery, ProgramDashboardDto>
    {
        private readonly IMediator _mediator;
        private readonly IProgramDashboardRepository _programDashboardRepository;

        public GetProgramDashboardQueryHandler(IMediator mediator, IProgramDashboardRepository programDashboardRepository)
        {
            _mediator = mediator;
            _programDashboardRepository = programDashboardRepository;
        }

        public async Task<ProgramDashboardDto> Handle(GetProgramDashboardQuery request, CancellationToken cancellationToken)
        {
            var program = await _programDashboardRepository.GetProgramByIdAsync(request.ProgramId, cancellationToken);
            if (program == null) return null;

            var projects = await _programDashboardRepository.GetProjectsByProgramIdAsync(request.ProgramId, cancellationToken);

            // Aggregate data from granular handlers
            var totalRevenueActual = await _mediator.Send(new GetProgramTotalRevenueActualQuery { ProgramId = request.ProgramId }, cancellationToken);
            var totalRevenueExpected = await _mediator.Send(new GetProgramTotalRevenueExpectedQuery { ProgramId = request.ProgramId }, cancellationToken);
            var profit = await _mediator.Send(new GetProgramProfitMarginQuery { ProgramId = request.ProgramId }, cancellationToken);
            var npv = await _mediator.Send(new GetProgramNpvQuery { ProgramId = request.ProgramId }, cancellationToken);
            var pendingForms = await _mediator.Send(new GetProgramPendingFormsQuery { ProgramId = request.ProgramId }, cancellationToken);
            var milestones = await _mediator.Send(new GetProgramMilestonesQuery { ProgramId = request.ProgramId }, cancellationToken);
            var cashflow = await _mediator.Send(new GetProgramMonthlyCashflowQuery { ProgramId = request.ProgramId }, cancellationToken);
            var regionalPortfolio = await _mediator.Send(new GetProgramRegionalPortfolioQuery { ProgramId = request.ProgramId }, cancellationToken);
            var projectsAtRisk = await _mediator.Send(new GetProgramProjectsAtRiskQuery { ProgramId = request.ProgramId }, cancellationToken);
            var taskMatrix = await _mediator.Send(new GetProgramTaskPriorityMatrixQuery { ProgramId = request.ProgramId }, cancellationToken);

            return new ProgramDashboardDto
            {
                ProgramId = program.Id,
                ProgramName = program.Name,
                TotalProjects = projects.Count,
                
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

                // NPV & Profitability
                CurrentNpv = npv.CurrentNpv,
                HighProfitProjectsCount = npv.HighProfitProjectsCount,
                MediumProfitProjectsCount = npv.MediumProfitProjectsCount,
                LowProfitProjectsCount = npv.LowProfitProjectsCount,
                WhatIfAnalysis = npv.WhatIfAnalysis,


                // Collections
                PendingForms = pendingForms,
                Milestones = milestones,
                MonthlyCashflow = cashflow,
                RegionalPortfolio = regionalPortfolio,
                ProjectsAtRisk = projectsAtRisk,
                TaskPriorityMatrix = taskMatrix
            };
        }
    }
}

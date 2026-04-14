using System.Collections.Generic;
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
                Currency = totalRevenueActual?.Currency ?? totalRevenueExpected?.Currency,
                
                // Revenue (Actual)
                TotalRevenueActual = totalRevenueActual?.TotalRevenue ?? 0,
                CompletedMilestonesCount = totalRevenueActual?.CompletedMilestonesCount ?? 0,
                RevenueChangeDescription = totalRevenueActual?.ChangeDescription ?? "0% vs last quarter",
                RevenueChangeType = totalRevenueActual?.ChangeType ?? "neutral",

                // Revenue (Expected)
                TotalRevenueExpected = totalRevenueExpected?.TotalRevenue ?? 0,

                // Profit
                ExpectedProfitMargin = profit?.ExpectedProfitMargin ?? 0,
                ExpectedProfitMarginChangeDescription = profit?.ExpectedProfitMarginChangeDescription ?? "0% improvement",
                ExpectedProfitMarginChangeType = profit?.ExpectedProfitMarginChangeType ?? "neutral",

                ActualProfitMargin = profit?.ActualProfitMargin ?? 0,
                ActualProfitMarginChangeDescription = profit?.ActualProfitMarginChangeDescription ?? "0% improvement",
                ActualProfitMarginChangeType = profit?.ActualProfitMarginChangeType ?? "neutral",

                // NPV & Profitability
                CurrentNpv = npv?.CurrentNpv ?? 0,
                HighProfitProjectsCount = npv?.HighProfitProjectsCount ?? 0,
                MediumProfitProjectsCount = npv?.MediumProfitProjectsCount ?? 0,
                LowProfitProjectsCount = npv?.LowProfitProjectsCount ?? 0,
                WhatIfAnalysis = npv?.WhatIfAnalysis ?? "Not enough data for analysis",


                // Collections
                PendingForms = pendingForms ?? new List<PendingFormDto>(),
                Milestones = milestones ?? new List<MilestoneBillingDto>(),
                MonthlyCashflow = cashflow ?? new List<MonthlyCashflowDto>(),
                RegionalPortfolio = regionalPortfolio ?? new List<RegionalPortfolioDto>(),
                ProjectsAtRisk = projectsAtRisk ?? new List<ProjectAtRiskDto>(),
                TaskPriorityMatrix = taskMatrix ?? new List<TaskPriorityItemDto>()
            };
        }
    }
}

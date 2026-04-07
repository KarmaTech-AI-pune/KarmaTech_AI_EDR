using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDR.Application.CQRS.Dashboard.ProjectDashboard.Queries;
using EDR.Repositories.Interfaces;

namespace EDR.Application.CQRS.Dashboard.ProjectDashboard.Handlers
{
    public class GetProjectTotalRevenueExpectedQueryHandler : IRequestHandler<GetProjectTotalRevenueExpectedQuery, TotalRevenueExpectedDto>
    {
        private readonly IProjectDashboardRepository _projectDashboardRepository;

        public GetProjectTotalRevenueExpectedQueryHandler(IProjectDashboardRepository projectDashboardRepository)
        {
            _projectDashboardRepository = projectDashboardRepository;
        }

        public async Task<TotalRevenueExpectedDto> Handle(GetProjectTotalRevenueExpectedQuery request, CancellationToken cancellationToken)
        {
            var project = await _projectDashboardRepository.GetProjectByIdAsync(request.ProjectId, cancellationToken);
            if (project == null) return null;

            var allJsf = await _projectDashboardRepository.GetJobStartFormsByProjectIdAsync(request.ProjectId, cancellationToken);

            var totalRevenueExpected = project.EstimatedProjectFee ?? 0;

            // Quarterly Changes
            var currentDate = DateTime.Now;
            var currentYear = currentDate.Year;
            var currentMonth = currentDate.Month;
            var currentQuarter = (currentMonth - 1) / 3 + 1;
            
            var previousQuarter = currentQuarter == 1 ? 4 : currentQuarter - 1;
            var previousQuarterYear = currentQuarter == 1 ? currentYear - 1 : currentYear;

            var currentQuarterRev = allJsf
                .Where(jsf => jsf.CreatedDate.Year == currentYear && ((jsf.CreatedDate.Month - 1) / 3 + 1) == currentQuarter)
                .Sum(jsf => jsf.TotalProjectFees);
            
            var prevQuarterRev = allJsf
                .Where(jsf => jsf.CreatedDate.Year == previousQuarterYear && ((jsf.CreatedDate.Month - 1) / 3 + 1) == previousQuarter)
                .Sum(jsf => jsf.TotalProjectFees);

            var revChange = prevQuarterRev > 0 ? ((currentQuarterRev - prevQuarterRev) / prevQuarterRev) * 100 : 0;

            return new TotalRevenueExpectedDto
            {
                TotalRevenue = Math.Round(totalRevenueExpected, 2),
                ChangeDescription = $"{revChange:F1}% vs last quarter",
                ChangeType = revChange > 0 ? "positive" : (revChange < 0 ? "negative" : "neutral")
            };
        }
    }
}

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
    public class GetProjectActualProfitMarginQueryHandler : IRequestHandler<GetProjectActualProfitMarginQuery, ProjectActualProfitMarginDto>
    {
        private readonly IProjectDashboardRepository _projectDashboardRepository;

        public GetProjectActualProfitMarginQueryHandler(IProjectDashboardRepository projectDashboardRepository)
        {
            _projectDashboardRepository = projectDashboardRepository;
        }

        public async Task<ProjectActualProfitMarginDto> Handle(GetProjectActualProfitMarginQuery request, CancellationToken cancellationToken)
        {
            var project = await _projectDashboardRepository.GetProjectByIdAsync(request.ProjectId, cancellationToken);
            if (project == null) return null;

            var progressReports = await _projectDashboardRepository.GetMonthlyProgressesByProjectIdAsync(request.ProjectId, cancellationToken);

            var latestProgress = progressReports
                .OrderByDescending(mp => mp.Year)
                .ThenByDescending(mp => mp.Month)
                .FirstOrDefault();

            var actualProfitMargin = latestProgress?.CTCEAC?.GrossProfitPercentage ?? 0;

            // Quarterly Changes (Relative to actual performance)
            var currentDate = DateTime.Now;
            var currentYear = currentDate.Year;
            var currentMonth = currentDate.Month;
            var currentQuarter = (currentMonth - 1) / 3 + 1;
            
            var previousQuarter = currentQuarter == 1 ? 4 : currentQuarter - 1;
            var previousQuarterYear = currentQuarter == 1 ? currentYear - 1 : currentYear;

            var currentQuarterActual = progressReports
                .Where(mp => mp.Year == currentYear && ((mp.Month - 1) / 3 + 1) == currentQuarter)
                .Select(mp => mp.CTCEAC?.GrossProfitPercentage ?? 0).DefaultIfEmpty(0).Average();
            
            var prevQuarterActual = progressReports
                .Where(mp => mp.Year == previousQuarterYear && ((mp.Month - 1) / 3 + 1) == previousQuarter)
                .Select(mp => mp.CTCEAC?.GrossProfitPercentage ?? 0).DefaultIfEmpty(0).Average();

            var profitChange = prevQuarterActual > 0 ? ((currentQuarterActual - prevQuarterActual) / prevQuarterActual) * 100 : 0;

            return new ProjectActualProfitMarginDto
            {
                ActualProfitMargin = Math.Round(actualProfitMargin, 2),
                ChangeDescription = $"{profitChange:F1}% vs last quarter",
                ChangeType = profitChange > 0 ? "positive" : (profitChange < 0 ? "negative" : "neutral")
            };
        }
    }
}

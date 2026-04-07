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
    public class GetProjectProfitMarginQueryHandler : IRequestHandler<GetProjectProfitMarginQuery, ProjectProfitMarginDto>
    {
        private readonly IProjectDashboardRepository _projectDashboardRepository;

        public GetProjectProfitMarginQueryHandler(IProjectDashboardRepository projectDashboardRepository)
        {
            _projectDashboardRepository = projectDashboardRepository;
        }

        public async Task<ProjectProfitMarginDto> Handle(GetProjectProfitMarginQuery request, CancellationToken cancellationToken)
        {
            var project = await _projectDashboardRepository.GetProjectByIdAsync(request.ProjectId, cancellationToken);
            if (project == null) return null;

            var allJsf = await _projectDashboardRepository.GetJobStartFormsByProjectIdAsync(request.ProjectId, cancellationToken);
            var progressReports = await _projectDashboardRepository.GetMonthlyProgressesByProjectIdAsync(request.ProjectId, cancellationToken);

            var profitMargin = allJsf.Any() ? (double)allJsf.Average(jsf => jsf.ProfitPercentage) : 0;

            // Quarterly Changes
            var currentDate = DateTime.Now;
            var currentYear = currentDate.Year;
            var currentMonth = currentDate.Month;
            var currentQuarter = (currentMonth - 1) / 3 + 1;
            
            var previousQuarter = currentQuarter == 1 ? 4 : currentQuarter - 1;
            var previousQuarterYear = currentQuarter == 1 ? currentYear - 1 : currentYear;

            var currentQuarterProfit = allJsf
                .Where(jsf => jsf.CreatedDate.Year == currentYear && ((jsf.CreatedDate.Month - 1) / 3 + 1) == currentQuarter)
                .Select(jsf => jsf.ProfitPercentage).DefaultIfEmpty(0).Average();
            
            var prevQuarterProfit = allJsf
                .Where(jsf => jsf.CreatedDate.Year == previousQuarterYear && ((jsf.CreatedDate.Month - 1) / 3 + 1) == previousQuarter)
                .Select(jsf => jsf.ProfitPercentage).DefaultIfEmpty(0).Average();

            var profitChange = prevQuarterProfit > 0 ? ((currentQuarterProfit - prevQuarterProfit) / prevQuarterProfit) * 100 : 0;

            return new ProjectProfitMarginDto
            {
                ProfitMargin = Math.Round((decimal)profitMargin, 2),
                ProfitMarginChangeDescription = $"{profitChange:F1}% vs last quarter",
                ProfitMarginChangeType = profitChange > 0 ? "positive" : (profitChange < 0 ? "negative" : "neutral")
            };
        }
    }
}

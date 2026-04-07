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
    public class GetProjectRegionalPortfolioQueryHandler : IRequestHandler<GetProjectRegionalPortfolioQuery, List<RegionalPortfolioDto>>
    {
        private readonly IProjectDashboardRepository _projectDashboardRepository;

        public GetProjectRegionalPortfolioQueryHandler(IProjectDashboardRepository projectDashboardRepository)
        {
            _projectDashboardRepository = projectDashboardRepository;
        }

        public async Task<List<RegionalPortfolioDto>> Handle(GetProjectRegionalPortfolioQuery request, CancellationToken cancellationToken)
        {
            var project = await _projectDashboardRepository.GetProjectByIdAsync(request.ProjectId, cancellationToken);
            if (project == null || string.IsNullOrEmpty(project.Region)) return new List<RegionalPortfolioDto>();

            var progressReports = await _projectDashboardRepository.GetMonthlyProgressesByProjectIdAsync(request.ProjectId, cancellationToken);
            
            var allJsf = await _projectDashboardRepository.GetJobStartFormsByProjectIdAsync(request.ProjectId, cancellationToken);
            var totalRevenueExpected = project.EstimatedProjectFee ?? 0;
            var profitMargin = allJsf.Any() ? (double)allJsf.Average(j => j.ProfitPercentage) : 0;

            var currentDate = DateTime.Now;
            var currentYear = currentDate.Year;

            var regionalPortfolio = new List<RegionalPortfolioDto>();
            
            int q1 = IsActiveInQuarter(project.StartDate, project.EndDate, currentYear, 1) ? 1 : 0;
            int q2 = IsActiveInQuarter(project.StartDate, project.EndDate, currentYear, 2) ? 1 : 0;
            int q3 = IsActiveInQuarter(project.StartDate, project.EndDate, currentYear, 3) ? 1 : 0;
            int q4 = IsActiveInQuarter(project.StartDate, project.EndDate, currentYear, 4) ? 1 : 0;

            regionalPortfolio.Add(new RegionalPortfolioDto
            {
                Region = project.Region,
                Revenue = Math.Round(totalRevenueExpected, 2),
                Profit = Math.Round((decimal)profitMargin, 2),
                Q1 = q1,
                Q2 = q2,
                Q3 = q3,
                Q4 = q4
            });

            return regionalPortfolio;
        }

        private bool IsActiveInQuarter(DateTime? startDate, DateTime? endDate, int year, int quarter)
        {
            if (!startDate.HasValue) return false;
            DateTime qStart = new DateTime(year, (quarter - 1) * 3 + 1, 1);
            DateTime qEnd = qStart.AddMonths(3).AddDays(-1);
            DateTime start = startDate.Value;
            DateTime end = endDate ?? DateTime.MaxValue;
            return start <= qEnd && end >= qStart;
        }
    }
}

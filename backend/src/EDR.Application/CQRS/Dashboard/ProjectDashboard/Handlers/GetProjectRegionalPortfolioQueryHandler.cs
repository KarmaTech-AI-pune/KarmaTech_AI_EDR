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

            var allJsf = await _projectDashboardRepository.GetJobStartFormsByProjectIdAsync(request.ProjectId, cancellationToken);
            
            // Current project focus
            var latestJsf = allJsf.OrderByDescending(j => j.CreatedDate).FirstOrDefault();
            
            var totalRevenue = latestJsf?.TotalProjectFees ?? 0;
            var profitMargin = latestJsf != null && totalRevenue > 0 ? (latestJsf.Profit / totalRevenue) * 100 : 0;

            var currentYear = DateTime.Now.Year;

            var regionalPortfolio = new List<RegionalPortfolioDto>();
            
            int q1 = IsActiveInQuarter(project.StartDate, project.EndDate, currentYear, 1) ? 1 : 0;
            int q2 = IsActiveInQuarter(project.StartDate, project.EndDate, currentYear, 2) ? 1 : 0;
            int q3 = IsActiveInQuarter(project.StartDate, project.EndDate, currentYear, 3) ? 1 : 0;
            int q4 = IsActiveInQuarter(project.StartDate, project.EndDate, currentYear, 4) ? 1 : 0;

            regionalPortfolio.Add(new RegionalPortfolioDto
            {
                Region = project.Region,
                Revenue = Math.Round(totalRevenue, 2),
                Profit = Math.Round(profitMargin, 2),
                Q1 = q1,
                Q2 = q2,
                Q3 = q3,
                Q4 = q4,
                ProjectDetails = new List<RegionalProjectDetailDto>
                {
                    new RegionalProjectDetailDto
                    {
                        ProjectName = project.Name,
                        ProgramName = project.Program?.Name ?? ""
                    }
                }
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

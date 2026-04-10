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
    public class GetProgramRegionalPortfolioQueryHandler : IRequestHandler<GetProgramRegionalPortfolioQuery, List<RegionalPortfolioDto>>
    {
        private readonly IProgramDashboardRepository _programDashboardRepository;

        public GetProgramRegionalPortfolioQueryHandler(IProgramDashboardRepository programDashboardRepository)
        {
            _programDashboardRepository = programDashboardRepository;
        }

        public async Task<List<RegionalPortfolioDto>> Handle(GetProgramRegionalPortfolioQuery request, CancellationToken cancellationToken)
        {
            var projects = await _programDashboardRepository.GetProjectsByProgramIdAsync(request.ProgramId, cancellationToken);
            if (!projects.Any()) return new List<RegionalPortfolioDto>();

            var projectIds = projects.Select(p => p.Id).ToList();
            var allJsf = await _programDashboardRepository.GetJobStartFormsByProjectIdsAsync(projectIds, cancellationToken);
            var progressReports = await _programDashboardRepository.GetMonthlyProgressesByProjectIdsAsync(projectIds, cancellationToken);

            var currentDate = DateTime.Now;
            var currentYear = currentDate.Year;

            var regionalPortfolio = projects
                .GroupBy(p => p.Region)
                .Select(group => {
                    var regionName = group.Key ?? "Unknown";
                    var regionProjects = group.ToList();
                    var regionProjectIds = regionProjects.Select(p => p.Id).ToList();
                    var regionReports = progressReports.Where(r => regionProjectIds.Contains(r.ProjectId)).ToList();

                    var regionRevenue = regionProjects.Sum(p => p.EstimatedProjectFee ?? 0);
                    var regionJsf = allJsf.Where(j => regionProjectIds.Contains(j.ProjectId)).ToList();
                    var regionProfit = regionJsf.Any() ? (double)regionJsf.Average(j => j.ProfitPercentage) : 0;

                    return new RegionalPortfolioDto
                    {
                        Region = regionName,
                        Revenue = Math.Round(regionRevenue, 2),
                        Profit = Math.Round((decimal)regionProfit, 2),
                        Q1 = group.Count(p => IsActiveInQuarter(p.StartDate, p.EndDate, currentYear, 1)),
                        Q2 = group.Count(p => IsActiveInQuarter(p.StartDate, p.EndDate, currentYear, 2)),
                        Q3 = group.Count(p => IsActiveInQuarter(p.StartDate, p.EndDate, currentYear, 3)),
                        Q4 = group.Count(p => IsActiveInQuarter(p.StartDate, p.EndDate, currentYear, 4))
                    };
                })
                .ToList();

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

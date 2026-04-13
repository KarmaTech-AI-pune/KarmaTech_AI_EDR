using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDR.Application.CQRS.Dashboard.ProgramDashboard.Queries;
using EDR.Application.Dtos.ProgramDashboard;
using EDR.Repositories.Interfaces;
using EDR.Domain.Entities;

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
            var activeProjects = projects.Where(p => p.Status == ProjectStatus.Active || p.Status == ProjectStatus.InProgress).ToList();
            
            if (!activeProjects.Any()) return new List<RegionalPortfolioDto>();

            var projectIds = activeProjects.Select(p => p.Id).ToList();
            var allJsf = await _programDashboardRepository.GetJobStartFormsByProjectIdsAsync(projectIds, cancellationToken);

            // Latest JSF per project
            var latestJsfs = allJsf
                .GroupBy(jsf => jsf.ProjectId)
                .Select(g => g.OrderByDescending(jsf => jsf.CreatedDate).FirstOrDefault())
                .Where(jsf => jsf != null)
                .ToList();

            var currentYear = DateTime.Now.Year;

            var regionalPortfolio = activeProjects
                .Where(p => !string.IsNullOrEmpty(p.Region))
                .GroupBy(p => p.Region)
                .Select(group => {
                    var regionName = group.Key;
                    var regionProjects = group.ToList();
                    var regionProjectIds = regionProjects.Select(p => p.Id).ToList();
                    var regionJsfs = latestJsfs.Where(jsf => regionProjectIds.Contains(jsf.ProjectId)).ToList();

                    // Weighted Financials
                    decimal totalRevenue = regionJsfs.Sum(jsf => jsf.TotalProjectFees);
                    decimal totalProfitValue = regionJsfs.Sum(jsf => jsf.Profit);
                    decimal weightedProfitMargin = totalRevenue > 0 ? (totalProfitValue / totalRevenue) * 100 : 0;

                    // Project Details
                    var details = regionProjects
                        .Select(p => new RegionalProjectDetailDto
                        {
                            ProjectName = p.Name,
                            ProgramName = p.Program?.Name ?? ""
                        })
                        .OrderBy(d => d.ProjectName)
                        .ToList();

                    return new RegionalPortfolioDto
                    {
                        Region = regionName,
                        Revenue = Math.Round(totalRevenue, 2),
                        Profit = Math.Round(weightedProfitMargin, 2),
                        Q1 = regionProjects.Count(p => IsActiveInQuarter(p.StartDate, p.EndDate, currentYear, 1)),
                        Q2 = regionProjects.Count(p => IsActiveInQuarter(p.StartDate, p.EndDate, currentYear, 2)),
                        Q3 = regionProjects.Count(p => IsActiveInQuarter(p.StartDate, p.EndDate, currentYear, 3)),
                        Q4 = regionProjects.Count(p => IsActiveInQuarter(p.StartDate, p.EndDate, currentYear, 4)),
                        ProjectDetails = details
                    };
                })
                .OrderByDescending(r => r.Revenue)
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

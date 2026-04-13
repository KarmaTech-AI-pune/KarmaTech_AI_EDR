using MediatR;
using EDR.Application.CQRS.Dashboard.Dashboard.Queries;
using Microsoft.EntityFrameworkCore;
using EDR.Application.Dtos.Dashboard;
using EDR.Domain.Entities;
using EDR.Domain.Database;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace EDR.Application.CQRS.Dashboard.Dashboard.Handlers
{
    public class GetRegionalPortfolioQueryHandler : IRequestHandler<GetRegionalPortfolioQuery, List<RegionalPortfolioDto>>
    {
        private readonly ProjectManagementContext _context;

        public GetRegionalPortfolioQueryHandler(ProjectManagementContext context)
        {
            _context = context;
        }

        public async Task<List<RegionalPortfolioDto>> Handle(GetRegionalPortfolioQuery request, CancellationToken cancellationToken)
        {
            var projects = await _context.Projects
                .Include(p => p.Program)
                .Where(p => p.Status == ProjectStatus.Active || p.Status == ProjectStatus.InProgress)
                .ToListAsync(cancellationToken);

            if (!projects.Any()) return new List<RegionalPortfolioDto>();

            var projectIds = projects.Select(p => p.Id).ToList();
            var allJsfs = await _context.JobStartForms
                .Where(jsf => projectIds.Contains(jsf.ProjectId) && !jsf.IsDeleted)
                .ToListAsync(cancellationToken);

            // Latest JSF per project
            var latestJsfs = allJsfs
                .GroupBy(jsf => jsf.ProjectId)
                .Select(g => g.OrderByDescending(jsf => jsf.CreatedDate).FirstOrDefault())
                .Where(jsf => jsf != null)
                .ToList();

            var currentYear = DateTime.UtcNow.Year;
            var result = new List<RegionalPortfolioDto>();

            var regions = projects
                .Where(p => !string.IsNullOrEmpty(p.Region))
                .Select(p => p.Region)
                .Distinct()
                .ToList();

            foreach (var regionName in regions)
            {
                var regionProjects = projects.Where(p => p.Region == regionName).ToList();
                var regionProjectIds = regionProjects.Select(p => p.Id).ToList();
                var regionJsfs = latestJsfs.Where(jsf => regionProjectIds.Contains(jsf.ProjectId)).ToList();

                // Weighted Financials
                decimal totalRevenue = regionJsfs.Sum(jsf => jsf.TotalProjectFees);
                decimal totalProfitValue = regionJsfs.Sum(jsf => jsf.Profit);
                decimal weightedProfitMargin = totalRevenue > 0 ? (totalProfitValue / totalRevenue) * 100 : 0;

                // Quarterly Counts
                int q1 = regionProjects.Count(p => IsActiveInQuarter(p.StartDate, p.EndDate, currentYear, 1));
                int q2 = regionProjects.Count(p => IsActiveInQuarter(p.StartDate, p.EndDate, currentYear, 2));
                int q3 = regionProjects.Count(p => IsActiveInQuarter(p.StartDate, p.EndDate, currentYear, 3));
                int q4 = regionProjects.Count(p => IsActiveInQuarter(p.StartDate, p.EndDate, currentYear, 4));

                // Project Details (Program + Project)
                var details = regionProjects
                    .Select(p => new RegionalProjectDetailDto
                    {
                        ProjectName = p.Name,
                        ProgramName = p.Program?.Name ?? "General"
                    })
                    .OrderBy(d => d.ProgramName).ThenBy(d => d.ProjectName)
                    .ToList();

                result.Add(new RegionalPortfolioDto
                {
                    Region = regionName,
                    Revenue = Math.Round(totalRevenue, 2),
                    Profit = Math.Round(weightedProfitMargin, 2),
                    Q1 = q1,
                    Q2 = q2,
                    Q3 = q3,
                    Q4 = q4,
                    ProjectDetails = details
                });
            }

            return result.OrderByDescending(r => r.Revenue).ToList();
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

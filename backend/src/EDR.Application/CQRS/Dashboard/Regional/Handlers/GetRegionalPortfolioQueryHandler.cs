using MediatR;
using Microsoft.EntityFrameworkCore;
using EDR.Application.Dtos.Dashboard;
using EDR.Application.CQRS.Dashboard.Regional.Queries;
using EDR.Domain.Entities;
using EDR.Domain.Database;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace EDR.Application.CQRS.Dashboard.Regional.Handlers
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
            // Fetch all active projects with their JobStartForm
            var projects = await _context.Projects
                .Include(p => p.ProjectManager) // Optional, if needed for other logic
                //.Where(p => p.Status == ProjectStatus.Active) // Removed filter to show all projects
                .Select(p => new
                {
                    p.Id,
                    p.Region,
                    p.StartDate,
                    p.EndDate,
                    // Get financial data from JobStartForm associated with this project
                    JobStartForm = _context.JobStartForms.FirstOrDefault(jsf => jsf.ProjectId == p.Id && !jsf.IsDeleted)
                })
                .ToListAsync(cancellationToken);

            // Group by Region
            var regionalGroups = projects
                .Where(p => !string.IsNullOrEmpty(p.Region))
                .GroupBy(p => p.Region)
                .ToList();

            var result = new List<RegionalPortfolioDto>();
            var currentYear = DateTime.UtcNow.Year;

            foreach (var group in regionalGroups)
            {
                var regionName = group.Key;
                
                // Calculate Revenue: Sum of TotalProjectFees
                decimal totalRevenue = group.Sum(p => p.JobStartForm?.TotalProjectFees ?? 0);

                // Calculate Profit: Average of ProfitPercentage
                // Note: ProfitPercentage might be 0-100 or 0-1. Assuming 0-100 based on mock data (e.g. 18 for 18%)
                double averageProfit = 0;
                if (group.Any(p => p.JobStartForm != null))
                {
                    averageProfit = group
                        .Where(p => p.JobStartForm != null)
                        .Average(p => (double)(p.JobStartForm.ProfitPercentage));
                }

                // Calculate Quarterly Counts
                // A project is active in a quarter if its date range overlaps with the quarter
                int q1Count = group.Count(p => IsActiveInQuarter(p.StartDate, p.EndDate, currentYear, 1));
                int q2Count = group.Count(p => IsActiveInQuarter(p.StartDate, p.EndDate, currentYear, 2));
                int q3Count = group.Count(p => IsActiveInQuarter(p.StartDate, p.EndDate, currentYear, 3));
                int q4Count = group.Count(p => IsActiveInQuarter(p.StartDate, p.EndDate, currentYear, 4));

                result.Add(new RegionalPortfolioDto
                {
                    Region = regionName,
                    Revenue = totalRevenue,
                    Profit = (decimal)Math.Round(averageProfit, 2),
                    Q1 = q1Count,
                    Q2 = q2Count,
                    Q3 = q3Count,
                    Q4 = q4Count
                });
            }

            return result;
        }

        private bool IsActiveInQuarter(DateTime? startDate, DateTime? endDate, int year, int quarter)
        {
            if (!startDate.HasValue) return false;

            DateTime qStart = new DateTime(year, (quarter - 1) * 3 + 1, 1);
            DateTime qEnd = qStart.AddMonths(3).AddDays(-1);

            DateTime start = startDate.Value;
            DateTime end = endDate ?? DateTime.MaxValue; // If no end date, assume ongoing

            // Check for overlap
            return start <= qEnd && end >= qStart;
        }
    }
}


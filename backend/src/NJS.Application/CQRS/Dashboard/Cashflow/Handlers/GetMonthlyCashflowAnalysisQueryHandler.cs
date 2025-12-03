using MediatR;
using Microsoft.EntityFrameworkCore;
using NJS.Application.Dtos.Dashboard;
using NJS.Application.CQRS.Dashboard.Cashflow.Queries;
using NJS.Domain.Database;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using System.Globalization;

namespace NJS.Application.CQRS.Dashboard.Cashflow.Handlers
{
    public class GetMonthlyCashflowAnalysisQueryHandler : IRequestHandler<GetMonthlyCashflowAnalysisQuery, List<MonthlyCashflowDto>>
    {
        private readonly ProjectManagementContext _context;

        public GetMonthlyCashflowAnalysisQueryHandler(ProjectManagementContext context)
        {
            _context = context;
        }

        public async Task<List<MonthlyCashflowDto>> Handle(GetMonthlyCashflowAnalysisQuery request, CancellationToken cancellationToken)
        {
            // 1. Fetch JobStartForms to get Total Project Fees for ALL projects
            var projectFees = await _context.JobStartForms
                .Where(jsf => !jsf.IsDeleted)
                .Select(jsf => new { jsf.ProjectId, jsf.TotalProjectFees })
                .ToDictionaryAsync(x => x.ProjectId, x => x.TotalProjectFees, cancellationToken);

            // 2. Fetch all Planned Hours for ALL projects
            // Join WBSTaskPlannedHour -> WBSTask -> WorkBreakdownStructure -> Project
            var plannedHoursQuery = from ph in _context.WBSTaskPlannedHours
                                    join t in _context.WBSTasks on ph.WBSTaskId equals t.Id
                                    join wbs in _context.WorkBreakdownStructures on t.WorkBreakdownStructureId equals wbs.Id
                                    where !t.IsDeleted
                                    select new { wbs.ProjectId, ph.Month, ph.Year, ph.PlannedHours };

            var plannedHoursList = await plannedHoursQuery.ToListAsync(cancellationToken);

            // Group planned hours by ProjectId
            var projectPlannedHours = plannedHoursList
                .GroupBy(ph => ph.ProjectId)
                .ToDictionary(g => g.Key, g => g.ToList());

            // 3. Fetch Actual Revenue from MonthlyProgress for ALL projects
            var monthlyProgressList = await _context.MonthlyProgresses
                .Include(mp => mp.FinancialDetails)
                .ToListAsync(cancellationToken);

            // 4. Aggregate data by Month across ALL projects
            var allMonths = new HashSet<(int Year, int Month)>();

            foreach (var item in plannedHoursList)
            {
                if (int.TryParse(item.Year, out int y) && TryParseMonth(item.Month, out int m))
                {
                    allMonths.Add((y, m));
                }
            }

            foreach (var item in monthlyProgressList)
            {
                allMonths.Add((item.Year, item.Month));
            }

            var result = new List<MonthlyCashflowDto>();
            var sortedMonths = allMonths.OrderBy(x => x.Year).ThenBy(x => x.Month).ToList();

            if (!sortedMonths.Any())
            {
                 var currentYear = DateTime.UtcNow.Year;
                for (int i = 1; i <= 12; i++)
                {
                    result.Add(new MonthlyCashflowDto
                    {
                        Month = CultureInfo.CurrentCulture.DateTimeFormat.GetAbbreviatedMonthName(i),
                        Planned = 0,
                        Actual = 0,
                        Variance = 0
                    });
                }
                return result;
            }

            foreach (var (year, month) in sortedMonths)
            {
                string monthName = CultureInfo.CurrentCulture.DateTimeFormat.GetAbbreviatedMonthName(month);
                decimal totalPlannedRevenueForMonth = 0;
                decimal totalActualRevenueForMonth = 0;

                // Calculate Planned Revenue (Sum of all projects)
                foreach (var projectId in projectFees.Keys)
                {
                    if (projectPlannedHours.ContainsKey(projectId))
                    {
                        var projHours = projectPlannedHours[projectId];
                        double totalProjPlannedHours = projHours.Sum(ph => ph.PlannedHours);
                        
                        if (totalProjPlannedHours > 0)
                        {
                             var monthlyProjPlannedHours = projHours
                                .Where(ph => IsSameMonth(ph.Month, month) && ph.Year == year.ToString())
                                .Sum(ph => ph.PlannedHours);

                             decimal projFees = projectFees[projectId];
                             decimal projMonthlyPlannedRevenue = (decimal)((monthlyProjPlannedHours / totalProjPlannedHours) * (double)projFees);
                             
                             totalPlannedRevenueForMonth += projMonthlyPlannedRevenue;
                        }
                    }
                }

                // Calculate Actual Revenue (Sum of all projects)
                totalActualRevenueForMonth = monthlyProgressList
                    .Where(mp => mp.Year == year && mp.Month == month)
                    .Sum(mp => mp.FinancialDetails?.FeeTotal ?? 0);

                result.Add(new MonthlyCashflowDto
                {
                    Month = monthName,
                    Planned = Math.Round(totalPlannedRevenueForMonth, 2),
                    Actual = Math.Round(totalActualRevenueForMonth, 2),
                    Variance = Math.Round(totalActualRevenueForMonth - totalPlannedRevenueForMonth, 2)
                });
            }

            return result;
        }

        private bool TryParseMonth(string monthStr, out int month)
        {
            month = 0;
            if (string.IsNullOrWhiteSpace(monthStr)) return false;

            if (int.TryParse(monthStr, out int m))
            {
                if (m >= 1 && m <= 12)
                {
                    month = m;
                    return true;
                }
            }

            string[] formats = { "MMM", "MMMM" };
            if (DateTime.TryParseExact(monthStr, formats, CultureInfo.InvariantCulture, DateTimeStyles.None, out DateTime dt))
            {
                month = dt.Month;
                return true;
            }
            
             for (int i = 1; i <= 12; i++)
            {
                if (string.Equals(monthStr, CultureInfo.InvariantCulture.DateTimeFormat.GetAbbreviatedMonthName(i), StringComparison.OrdinalIgnoreCase) ||
                    string.Equals(monthStr, CultureInfo.InvariantCulture.DateTimeFormat.GetMonthName(i), StringComparison.OrdinalIgnoreCase))
                {
                    month = i;
                    return true;
                }
            }

            return false;
        }

        private bool IsSameMonth(string monthStr, int monthInt)
        {
            if (TryParseMonth(monthStr, out int m))
            {
                return m == monthInt;
            }
            return false;
        }
    }
}

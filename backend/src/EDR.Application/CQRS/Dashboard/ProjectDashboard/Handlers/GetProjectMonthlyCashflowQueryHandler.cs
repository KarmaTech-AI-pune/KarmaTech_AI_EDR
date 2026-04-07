using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDR.Application.CQRS.Dashboard.ProjectDashboard.Queries;
using EDR.Application.Dtos.ProjectDashboard;
using EDR.Repositories.Interfaces;

namespace EDR.Application.CQRS.Dashboard.ProjectDashboard.Handlers
{
    public class GetProjectMonthlyCashflowQueryHandler : IRequestHandler<GetProjectMonthlyCashflowQuery, List<MonthlyCashflowDto>>
    {
        private readonly IProjectDashboardRepository _projectDashboardRepository;

        public GetProjectMonthlyCashflowQueryHandler(IProjectDashboardRepository projectDashboardRepository)
        {
            _projectDashboardRepository = projectDashboardRepository;
        }

        public async Task<List<MonthlyCashflowDto>> Handle(GetProjectMonthlyCashflowQuery request, CancellationToken cancellationToken)
        {
            var project = await _projectDashboardRepository.GetProjectByIdAsync(request.ProjectId, cancellationToken);
            if (project == null) return new List<MonthlyCashflowDto>();

            var totalRevenueExpected = project.EstimatedProjectFee ?? 0;
            
            var plannedHoursRows = await _projectDashboardRepository.GetWbsPlannedHoursByProjectIdAsync(request.ProjectId, cancellationToken);
            var projectTotalPlannedHours = plannedHoursRows.Sum(ph => ph.PlannedHours);
            
            var progressReports = await _projectDashboardRepository.GetMonthlyProgressesByProjectIdAsync(request.ProjectId, cancellationToken);

            var allMonths = new HashSet<(int Year, int Month)>();
            foreach (var ph in plannedHoursRows) { if (int.TryParse(ph.Year, out int y) && TryParseMonth(ph.Month, out int m)) allMonths.Add((y, m)); }
            foreach (var mp in progressReports) { allMonths.Add((mp.Year, mp.Month)); }

            var cashflow = allMonths.OrderBy(x => x.Year).ThenBy(x => x.Month).Select(mo => {
                var monthPlannedHours = plannedHoursRows
                    .Where(ph => ph.Year == mo.Year.ToString() && IsSameMonth(ph.Month, mo.Month))
                    .Sum(ph => ph.PlannedHours);
                
                decimal plannedRev = projectTotalPlannedHours > 0 ? (decimal)((monthPlannedHours / projectTotalPlannedHours) * (double)totalRevenueExpected) : 0;
                decimal actualRev = progressReports.Where(mp => mp.Year == mo.Year && mp.Month == mo.Month).Sum(mp => mp.FinancialDetails?.FeeTotal ?? 0);

                return new MonthlyCashflowDto {
                    Month = CultureInfo.CurrentCulture.DateTimeFormat.GetAbbreviatedMonthName(mo.Month),
                    Planned = Math.Round(plannedRev, 2),
                    Actual = Math.Round(actualRev, 2),
                    Variance = Math.Round(actualRev - plannedRev, 2)
                };
            }).ToList();

            if (!cashflow.Any())
            {
                var now = DateTime.Now;
                for (int i = 5; i >= 0; i--) {
                    var date = now.AddMonths(-i);
                    cashflow.Add(new MonthlyCashflowDto { Month = date.ToString("MMM"), Planned = 0, Actual = 0, Variance = 0 });
                }
            }

            return cashflow;
        }

        private bool TryParseMonth(string monthStr, out int month)
        {
            month = 0; if (string.IsNullOrWhiteSpace(monthStr)) return false;
            if (int.TryParse(monthStr, out int m) && m >= 1 && m <= 12) { month = m; return true; }
            string[] formats = { "MMM", "MMMM" };
            if (DateTime.TryParseExact(monthStr, formats, CultureInfo.InvariantCulture, DateTimeStyles.None, out DateTime dt)) { month = dt.Month; return true; }
            for (int i = 1; i <= 12; i++) {
                if (string.Equals(monthStr, CultureInfo.InvariantCulture.DateTimeFormat.GetAbbreviatedMonthName(i), StringComparison.OrdinalIgnoreCase) ||
                    string.Equals(monthStr, CultureInfo.InvariantCulture.DateTimeFormat.GetMonthName(i), StringComparison.OrdinalIgnoreCase)) { month = i; return true; }
            }
            return false;
        }

        private bool IsSameMonth(string monthStr, int monthInt)
        {
            if (TryParseMonth(monthStr, out int m)) return m == monthInt;
            return false;
        }
    }
}

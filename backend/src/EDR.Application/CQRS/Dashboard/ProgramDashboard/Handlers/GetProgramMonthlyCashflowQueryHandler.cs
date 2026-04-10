using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDR.Application.CQRS.Dashboard.ProgramDashboard.Queries;
using EDR.Application.Dtos.ProgramDashboard;
using EDR.Repositories.Interfaces;

namespace EDR.Application.CQRS.Dashboard.ProgramDashboard.Handlers
{
    public class GetProgramMonthlyCashflowQueryHandler : IRequestHandler<GetProgramMonthlyCashflowQuery, List<MonthlyCashflowDto>>
    {
        private readonly IProgramDashboardRepository _programDashboardRepository;

        public GetProgramMonthlyCashflowQueryHandler(IProgramDashboardRepository programDashboardRepository)
        {
            _programDashboardRepository = programDashboardRepository;
        }

        public async Task<List<MonthlyCashflowDto>> Handle(GetProgramMonthlyCashflowQuery request, CancellationToken cancellationToken)
        {
            var projects = await _programDashboardRepository.GetProjectsByProgramIdAsync(request.ProgramId, cancellationToken);
            if (!projects.Any()) return new List<MonthlyCashflowDto>();

            var projectIds = projects.Select(p => p.Id).ToList();
            var totalRevenueExpected = projects.Sum(p => p.EstimatedProjectFee ?? 0);
            
            var plannedHoursRows = await _programDashboardRepository.GetWbsPlannedHoursByProjectIdsAsync(projectIds, cancellationToken);
            var programTotalPlannedHours = plannedHoursRows.Sum(ph => ph.PlannedHours);
            
            var progressReports = await _programDashboardRepository.GetMonthlyProgressesByProjectIdsAsync(projectIds, cancellationToken);

            var allMonths = new HashSet<(int Year, int Month)>();
            foreach (var ph in plannedHoursRows) { if (int.TryParse(ph.Year, out int y) && TryParseMonth(ph.Month, out int m)) allMonths.Add((y, m)); }
            foreach (var mp in progressReports) { allMonths.Add((mp.Year, mp.Month)); }

            var cashflow = allMonths.OrderBy(x => x.Year).ThenBy(x => x.Month).Select(mo => {
                var monthPlannedHours = plannedHoursRows
                    .Where(ph => ph.Year == mo.Year.ToString() && IsSameMonth(ph.Month, mo.Month))
                    .Sum(ph => ph.PlannedHours);
                
                decimal plannedRev = programTotalPlannedHours > 0 ? (decimal)((monthPlannedHours / programTotalPlannedHours) * (double)totalRevenueExpected) : 0;
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

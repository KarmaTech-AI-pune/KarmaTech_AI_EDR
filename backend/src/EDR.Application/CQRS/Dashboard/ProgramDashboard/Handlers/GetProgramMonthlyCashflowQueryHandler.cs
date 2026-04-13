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
        private readonly IMediator _mediator;

        public GetProgramMonthlyCashflowQueryHandler(IProgramDashboardRepository programDashboardRepository, IMediator mediator)
        {
            _programDashboardRepository = programDashboardRepository;
            _mediator = mediator;
        }

        public async Task<List<MonthlyCashflowDto>> Handle(GetProgramMonthlyCashflowQuery request, CancellationToken cancellationToken)
        {
            try
            {
                var projects = await _programDashboardRepository.GetProjectsByProgramIdAsync(request.ProgramId, cancellationToken);
                if (!projects.Any()) return new List<MonthlyCashflowDto>();

                var projectIds = projects.Select(p => p.Id).ToList();

                // 1. Get Project Cashflow Data (Planned) - Parallel execution for performance
                var cashflowTasks = projectIds.Select(async pid => 
                {
                    try {
                        var result = await _mediator.Send(new EDR.Application.CQRS.Cashflow.Queries.GetAllCashflowsQuery { ProjectId = pid }, cancellationToken);
                        return new { ProjectId = pid, Cashflows = result?.Cashflows };
                    } catch {
                        return new { ProjectId = pid, Cashflows = (List<EDR.Application.Dtos.CashflowDto>)null };
                    }
                }).ToList();

                var budgetResults = await Task.WhenAll(cashflowTasks);
                var allProjectCashflows = budgetResults
                    .Where(x => x.Cashflows != null)
                    .ToDictionary(x => x.ProjectId, x => x.Cashflows);

                // 2. Get Progress Reports
                var progressReports = await _programDashboardRepository.GetMonthlyProgressesByProjectIdsAsync(projectIds, cancellationToken);

                // 3. Collect all unique months ONLY from Planned Cashflow (to match Project Dashboard behavior)
                var allMonths = new HashSet<(int Year, int Month)>();
                
                foreach (var kvp in allProjectCashflows)
                {
                    foreach (var cf in kvp.Value)
                    {
                        if (!string.IsNullOrEmpty(cf.Month) && DateTime.TryParseExact(cf.Month, "MMM-yy", CultureInfo.InvariantCulture, DateTimeStyles.None, out DateTime dt))
                            allMonths.Add((dt.Year, dt.Month));
                    }
                }

                if (!allMonths.Any())
                {
                    var now = DateTime.Now;
                    for (int i = 5; i >= 0; i--) {
                        var date = now.AddMonths(-i);
                        allMonths.Add((date.Year, date.Month));
                    }
                }

                // 4. Sort months and aggregate data
                var sortedMonths = allMonths.OrderBy(x => x.Year).ThenBy(x => x.Month).ToList();
                var result = new List<MonthlyCashflowDto>();

                foreach (var mo in sortedMonths)
                {
                    string monthLabel = CultureInfo.InvariantCulture.DateTimeFormat.GetAbbreviatedMonthName(mo.Month) + "-" + (mo.Year % 100).ToString("D2");
                    
                    var projectBreakdown = projects.Select(p => {
                        // Planned Cashflow for this month
                        decimal pPlanned = 0;
                        if (allProjectCashflows.TryGetValue(p.Id, out var cfList))
                        {
                            var cf = cfList.FirstOrDefault(x => !string.IsNullOrEmpty(x.Month) && 
                                DateTime.TryParseExact(x.Month, "MMM-yy", CultureInfo.InvariantCulture, DateTimeStyles.None, out DateTime dt) && 
                                dt.Year == mo.Year && dt.Month == mo.Month);
                            pPlanned = cf?.CashFlow ?? 0;
                        }

                        // Actual Revenue from Progress Reports (Matching project logic: by mp.Year/Month)
                        decimal pActual = progressReports
                            .Where(mp => mp.ProjectId == p.Id && mp.Year == mo.Year && mp.Month == mo.Month)
                            .SelectMany(mp => mp.ProgressDeliverables ?? new List<EDR.Domain.Entities.ProgressDeliverable>())
                            .Sum(d => d.PaymentDue ?? 0);

                        return new { p.Name, pPlanned, pActual };
                    }).ToList();

                    decimal totalPlanned = projectBreakdown.Sum(x => x.pPlanned);
                    decimal totalActual = projectBreakdown.Sum(x => x.pActual);

                    result.Add(new MonthlyCashflowDto {
                        Month = monthLabel,
                        Planned = Math.Round(totalPlanned, 2),
                        Actual = Math.Round(totalActual, 2),
                        Variance = Math.Round(totalActual + totalPlanned, 2),
                        ProjectBreakdown = projectBreakdown
                            .Where(x => x.pPlanned != 0 || x.pActual != 0)
                            .Select(x => new ProjectCashflowDto {
                                ProjectName = x.Name ?? "Unknown",
                                Planned = Math.Round(x.pPlanned, 2),
                                Actual = Math.Round(x.pActual, 2)
                            }).ToList()
                    });
                }

                return result;
            }
            catch (Exception ex)
            {
                throw new Exception($"Failed to aggregate program monthly cashflow: {ex.Message}", ex);
            }
        }

        private bool TryParseDateTime(string dateStr, out DateTime result)
        {
            result = default;
            if (string.IsNullOrWhiteSpace(dateStr)) return false;

            // Try standard parsing
            if (DateTime.TryParse(dateStr, out result)) return true;

            // Try common formats used in the app
            string[] formats = { "yyyy-MM-dd", "MM/dd/yyyy", "dd/MM/yyyy", "MMM-yy", "MMM-yyyy", "MMM yyyy" };
            return DateTime.TryParseExact(dateStr, formats, CultureInfo.InvariantCulture, DateTimeStyles.None, out result);
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
    }
}

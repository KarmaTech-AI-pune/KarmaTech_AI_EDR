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
        private readonly IMediator _mediator;

        public GetProjectMonthlyCashflowQueryHandler(IProjectDashboardRepository projectDashboardRepository, IMediator mediator)
        {
            _projectDashboardRepository = projectDashboardRepository;
            _mediator = mediator;
        }

        public async Task<List<MonthlyCashflowDto>> Handle(GetProjectMonthlyCashflowQuery request, CancellationToken cancellationToken)
        {
            var project = await _projectDashboardRepository.GetProjectByIdAsync(request.ProjectId, cancellationToken);
            if (project == null) return new List<MonthlyCashflowDto>();

            // Get budget data from the source of truth (Budget Table logic)
            var budgetQuery = new EDR.Application.CQRS.Cashflow.Queries.GetAllCashflowsQuery { ProjectId = request.ProjectId };
            var budgetResult = await _mediator.Send(budgetQuery, cancellationToken);
            
            var progressReports = await _projectDashboardRepository.GetMonthlyProgressesByProjectIdAsync(request.ProjectId, cancellationToken);

            if (budgetResult?.Cashflows == null || !budgetResult.Cashflows.Any())
            {
                var now = DateTime.Now;
                var fallback = new List<MonthlyCashflowDto>();
                for (int i = 5; i >= 0; i--) {
                    var date = now.AddMonths(-i);
                    fallback.Add(new MonthlyCashflowDto { Month = date.ToString("MMM"), Planned = 0, Actual = 0, Variance = 0 });
                }
                return fallback;
            }

            var cashflow = budgetResult.Cashflows.Select(cf => {
                // Determine year/month for actual progress mapping
                int year = DateTime.Now.Year;
                int month = 1;
                if (DateTime.TryParse(cf.Month, out DateTime dt))
                {
                    year = dt.Year;
                    month = dt.Month;
                }

                decimal plannedCashFlow = cf.CashFlow ?? 0;
                
                // Fetch actual revenue from completed milestones in the specific month's progress report
                decimal actualRevenue = progressReports
                    .Where(mp => mp.Year == year && mp.Month == month)
                    .SelectMany(mp => mp.ProgressDeliverables ?? new List<EDR.Domain.Entities.ProgressDeliverable>())
                    .Sum(pd => pd.PaymentDue ?? 0);

                return new MonthlyCashflowDto {
                    Month = cf.Month,
                    Planned = Math.Round(plannedCashFlow, 2),
                    Actual = Math.Round(actualRevenue, 2),
                    Variance = Math.Round(plannedCashFlow + actualRevenue, 2)
                };
            }).ToList();

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

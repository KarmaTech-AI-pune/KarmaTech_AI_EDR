using MediatR;
using NJS.Application.DTOs;
using NJS.Domain.Entities;
using NJS.Repositories.Interfaces;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using NJS.Application.CQRS.Cashflow.Queries;

namespace NJS.Application.CQRS.Cashflow.Handlers
{
    public class GetCumulativeCashflowsQueryHandler : IRequestHandler<GetCumulativeCashflowsQuery, List<CumulativeCashflowDto>>
    {
        private readonly IMonthlyProgressRepository _monthlyProgressRepository;

        public GetCumulativeCashflowsQueryHandler(IMonthlyProgressRepository monthlyProgressRepository)
        {
            _monthlyProgressRepository = monthlyProgressRepository;
        }

        public async Task<List<CumulativeCashflowDto>> Handle(GetCumulativeCashflowsQuery request, CancellationToken cancellationToken)
        {
            var monthlyProgresses = await _monthlyProgressRepository.GetByProjectIdAsync(request.ProjectId);
            
            // Sort by Year then Month
            monthlyProgresses = monthlyProgresses.OrderBy(mp => mp.Year).ThenBy(mp => mp.Month).ToList();

            var result = new List<CumulativeCashflowDto>();
            decimal runningRevenue = 0;

            foreach (var mp in monthlyProgresses)
            {
                // Calculate monthly revenue from completed deliverables
                // User said: "revenue is whivh miltons is completed in that add all paymentDue"
                // Assuming "completed" means AchievedDate is not null. 
                // Using PaymentDue as the value to add.
                decimal monthlyRevenue = 0;
                if (mp.ProgressDeliverables != null)
                {
                    monthlyRevenue = mp.ProgressDeliverables
                        .Where(pd => pd.AchievedDate.HasValue)
                        .Sum(pd => pd.PaymentDue ?? 0);
                }

                runningRevenue += monthlyRevenue;

                // Cumulative Costs from ContractAndCost -> TotalCumulativeCost
                decimal cumulativeCost = mp.ContractAndCost?.TotalCumulativeCost ?? 0;

                // Net Position
                decimal netPosition = runningRevenue - cumulativeCost;

                // Cash Position
                string cashPosition = netPosition >= 0 ? "Positive" : "Negative";

                // Format Period "MMM-yy" e.g., "Jan-25"
                string period = new System.DateTime(mp.Year, mp.Month, 1).ToString("MMM-yy");

                result.Add(new CumulativeCashflowDto
                {
                    Period = period,
                    CumulativeCosts = cumulativeCost,
                    CumulativeRevenue = runningRevenue,
                    NetPosition = netPosition,
                    CashPosition = cashPosition
                });
            }

            return result;
        }
    }
}

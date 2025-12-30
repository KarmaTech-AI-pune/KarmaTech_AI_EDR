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
    public class GetFinancialSummaryQueryHandler : IRequestHandler<GetFinancialSummaryQuery, FinancialSummaryDto>
    {
        private readonly IMonthlyProgressRepository _monthlyProgressRepository;

        public GetFinancialSummaryQueryHandler(IMonthlyProgressRepository monthlyProgressRepository)
        {
            _monthlyProgressRepository = monthlyProgressRepository;
        }

        public async Task<FinancialSummaryDto> Handle(GetFinancialSummaryQuery request, CancellationToken cancellationToken)
        {
            var monthlyProgresses = await _monthlyProgressRepository.GetByProjectIdAsync(request.ProjectId);
            
            // Latest Monthly Progress
            var latestMp = monthlyProgresses
                .OrderByDescending(mp => mp.Year)
                .ThenByDescending(mp => mp.Month)
                .FirstOrDefault();

            if (latestMp == null)
            {
                return new FinancialSummaryDto();
            }

            // Total Project Value: FinancialDetails.Net
            decimal totalProjectValue = latestMp.FinancialDetails?.Net ?? 0;

            // Amount Invoiced: Sum of PaymentDue for ALL Deliverables across ALL data
            // Assuming duplicates are handled or deliverables are instance-specific to months
            // User requested "sum of all milestones amount".
            decimal amountInvoiced = monthlyProgresses
                .Where(mp => mp.ProgressDeliverables != null)
                .SelectMany(mp => mp.ProgressDeliverables)
                .Sum(pd => pd.PaymentDue ?? 0);

            // Amount Spent: TotalCumulativeCost
            decimal amountSpent = latestMp.ContractAndCost?.TotalCumulativeCost ?? 0;

            // Current Cash Position
            decimal currentCashPosition = amountInvoiced - amountSpent;

            return new FinancialSummaryDto
            {
                TotalProjectValue = totalProjectValue,
                AmountInvoiced = amountInvoiced,
                AmountSpent = amountSpent,
                CurrentCashPosition = currentCashPosition
            };
        }
    }
}

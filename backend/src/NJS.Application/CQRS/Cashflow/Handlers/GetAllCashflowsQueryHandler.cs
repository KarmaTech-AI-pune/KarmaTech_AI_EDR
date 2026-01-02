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
    public class GetAllCashflowsQueryHandler : IRequestHandler<Queries.GetAllCashflowsQuery, List<CashflowDto>>
    {
        private readonly IMonthlyProgressRepository _monthlyProgressRepository;

        public GetAllCashflowsQueryHandler(IMonthlyProgressRepository monthlyProgressRepository)
        {
            _monthlyProgressRepository = monthlyProgressRepository;
        }


        public async Task<List<CashflowDto>> Handle(Queries.GetAllCashflowsQuery request, CancellationToken cancellationToken)
        {
            var monthlyProgresses = await _monthlyProgressRepository.GetByProjectIdAsync(request.ProjectId);
            
            // Sort by Year then Month
            monthlyProgresses = monthlyProgresses.OrderBy(mp => mp.Year).ThenBy(mp => mp.Month).ToList();

            return monthlyProgresses.Select(mp => 
            {
                // Calculate Revenue from BudgetTable -> OriginalBudget -> RevenueFee
                decimal revenue = mp.BudgetTable?.OriginalBudget?.RevenueFee ?? 0;
                
                // Calculate Total Costs from ContractAndCost -> ActualSubtotal
                // Note: User mentioned "actualsubtotal means total costs"
                decimal totalCosts = mp.ContractAndCost?.ActualSubtotal ?? 0;

                // Net Cash Flow = Revenue - Total Costs
                decimal netCashFlow = revenue - totalCosts;

                // Status Logic: 
                // "paymentReceivedDate is less than current data so is compement status"
                // Checking if any deliverable has been paid
                bool isCompleted = false;
                if (mp.ProgressDeliverables != null && mp.ProgressDeliverables.Any())
                {
                    // Check if any deliverable has a PaymentReceivedDate that is in the past
                    isCompleted = mp.ProgressDeliverables.Any(pd => pd.PaymentReceivedDate.HasValue && pd.PaymentReceivedDate.Value < System.DateTime.Now);
                }
                
                string status = isCompleted ? "Completed" : "Planned";
                
                // Format Period "MMM-yy" e.g., "Jan-25"
                string period = new System.DateTime(mp.Year, mp.Month, 1).ToString("MMM-yy");

                return new CashflowDto
                {
                    Id = mp.Id, // Using MP ID as it represents the row
                    ProjectId = mp.ProjectId,
                    Month = period, 
                    
                    // Personnel -> ActualStaff
                    PersonnelCost = mp.ContractAndCost?.ActualStaff,
                    
                    // ODC -> ActualOdc
                    OdcCost = mp.ContractAndCost?.ActualOdc,
                    
                    // Total Costs
                    TotalProjectCost = totalCosts,
                    
                    // Revenue
                    Revenue = revenue,
                    
                    // Net Cash Flow
                    CashFlow = netCashFlow,

                    // Status
                    Status = status,

                    // Fields not explicitly mapped in requirements but kept or set to null/0 if not applicable
                    CumulativeCost = mp.ContractAndCost?.TotalCumulativeCost
                };
            }).ToList();
        }
    }
}

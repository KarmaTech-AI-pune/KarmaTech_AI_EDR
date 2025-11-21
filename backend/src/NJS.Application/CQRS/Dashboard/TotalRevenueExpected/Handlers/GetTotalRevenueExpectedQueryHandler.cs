using MediatR;
using Microsoft.EntityFrameworkCore;
using NJS.Domain.Database;
using NJS.Application.DTOs.Dashboard;
using NJS.Domain.Entities;

namespace NJS.Application.CQRS.Dashboard.TotalRevenueExpected.Handlers
{
    public class GetTotalRevenueExpectedQueryHandler : IRequestHandler<Queries.GetTotalRevenueExpectedQuery, TotalRevenueExpectedDto>
    {
        private readonly ProjectManagementContext _context;

        public GetTotalRevenueExpectedQueryHandler(ProjectManagementContext context)
        {
            _context = context;
        }

        public async Task<TotalRevenueExpectedDto> Handle(Queries.GetTotalRevenueExpectedQuery request, CancellationToken cancellationToken)
        {
            // Assuming OriginalBudget has a 'BudgetAmount' property that represents the revenue
            // and 'BudgetYear' and 'BudgetQuarter' for comparison.
            // This is a simplified example; actual logic might involve more complex filtering and aggregation.

            var totalRevenueExpected = await _context.Set<OriginalBudget>()
                                                    .SumAsync(b => b.RevenueFee, cancellationToken);

            // Placeholder for comparison logic, assuming a fixed value for now based on the image
            // In a real scenario, you'd fetch previous quarter's data.
            string comparisonToLastQuarter = "12.5% vs last quarter";
            decimal comparisonPercentage = 12.5m; // Example value

            return new TotalRevenueExpectedDto
            {
                TotalRevenueExpected = totalRevenueExpected,
                ComparisonToLastQuarter = comparisonToLastQuarter,
                ComparisonPercentage = comparisonPercentage
            };
        }
    }
}

using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NJS.Application.DTOs.Dashboard;
using NJS.Domain.Database;
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
            var currentDate = DateTime.Now;
            var currentYear = currentDate.Year;
            var currentMonth = currentDate.Month;

            var currentQuarter = (currentMonth - 1) / 3 + 1;
            var previousQuarter = currentQuarter == 1 ? 4 : currentQuarter - 1;
            var previousQuarterYear = currentQuarter == 1 ? currentYear - 1 : currentYear;

            var totalRevenueExpected = await _context.JobStartForms
                .Include(jsf => jsf.Project)
                .Where(jsf => jsf.Project.Status == ProjectStatus.Active ||
                              jsf.Project.Status == ProjectStatus.InProgress)
                .Where(jsf => jsf.Project.StartDate.HasValue &&
                              jsf.Project.StartDate.Value.Year == currentYear)
                .SumAsync(jsf => jsf.TotalProjectFees, cancellationToken);

            var previousQuarterRevenueExpected = await _context.JobStartForms
                .Include(jsf => jsf.Project)
                .Where(jsf => jsf.Project.Status == ProjectStatus.Active ||
                              jsf.Project.Status == ProjectStatus.InProgress)
                .Where(jsf => jsf.Project.StartDate.HasValue &&
                              jsf.Project.StartDate.Value.Year == previousQuarterYear &&
                              ((jsf.Project.StartDate.Value.Month - 1) / 3 + 1) == previousQuarter)
                .SumAsync(jsf => jsf.TotalProjectFees, cancellationToken);

            var revenueChange = previousQuarterRevenueExpected > 0
                ? ((totalRevenueExpected - previousQuarterRevenueExpected) / previousQuarterRevenueExpected) * 100
                : 0;

            return new TotalRevenueExpectedDto
            {
                TotalRevenue = totalRevenueExpected,
                ChangeDescription = $"{revenueChange:F1}% vs last quarter",
                ChangeType = revenueChange > 0 ? "positive" : revenueChange < 0 ? "negative" : "neutral"
            };
        }
    }
}

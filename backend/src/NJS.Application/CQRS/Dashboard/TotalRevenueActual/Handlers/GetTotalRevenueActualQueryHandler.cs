using MediatR;
using NJS.Application.DTOs.Dashboard;
using NJS.Domain.Database;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using NJS.Application.CQRS.Dashboard.TotalRevenueActual.Queries;
using NJS.Domain.Entities;

namespace NJS.Application.CQRS.Dashboard.TotalRevenueActual.Handlers
{
    public class GetTotalRevenueActualQueryHandler : IRequestHandler<GetTotalRevenueActualQuery, TotalRevenueActualDto>
    {
        private readonly ProjectManagementContext _context;

        public GetTotalRevenueActualQueryHandler(ProjectManagementContext context)
        {
            _context = context;
        }

        public async Task<TotalRevenueActualDto> Handle(GetTotalRevenueActualQuery request, CancellationToken cancellationToken)
        {
            var currentDate = DateTime.Now;
            var currentYear = currentDate.Year;
            var currentMonth = currentDate.Month;

            var totalRevenueActual = await _context.MonthlyProgresses
                .Include(mp => mp.Project)
                .Where(mp => mp.Year == currentYear && mp.Month <= currentMonth)
                .Where(mp => mp.Project.Status == ProjectStatus.Active ||
                             mp.Project.Status == ProjectStatus.InProgress ||
                             mp.Project.Status == ProjectStatus.Completed)
                .SumAsync(mp => mp.FinancialDetails.FeeTotal ?? 0m, cancellationToken);

            var previousQuarter = (currentMonth - 1) / 3;
            var previousQuarterYear = previousQuarter == 0 ? currentYear - 1 : currentYear;
            var previousQuarterMonth = previousQuarter == 0 ? 12 : previousQuarter * 3;

            var previousQuarterRevenueActual = await _context.MonthlyProgresses
                .Include(mp => mp.Project)
                .Where(mp => mp.Year == previousQuarterYear && mp.Month <= previousQuarterMonth)
                .Where(mp => mp.Project.Status == ProjectStatus.Active ||
                             mp.Project.Status == ProjectStatus.InProgress ||
                             mp.Project.Status == ProjectStatus.Completed)
                .SumAsync(mp => mp.FinancialDetails.FeeTotal ?? 0m, cancellationToken);

            var revenueChange = previousQuarterRevenueActual > 0
                ? ((totalRevenueActual - previousQuarterRevenueActual) / previousQuarterRevenueActual) * 100
                : 0;

            return new TotalRevenueActualDto
            {
                TotalRevenue = totalRevenueActual,
                ChangeDescription = $"{revenueChange:F1}% vs last quarter",
                ChangeType = revenueChange > 0 ? "positive" : revenueChange < 0 ? "negative" : "neutral"
            };
        }
    }
}

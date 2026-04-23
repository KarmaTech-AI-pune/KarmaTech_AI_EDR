using MediatR;
using EDR.Application.CQRS.Dashboard.Dashboard.Queries;
using EDR.Application.Dtos.Dashboard;
using EDR.Domain.Database;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using EDR.Application.CQRS.Dashboard.Dashboard.Queries;
using EDR.Domain.Entities;

namespace EDR.Application.CQRS.Dashboard.Dashboard.Handlers
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
            var currentQuarter = (currentMonth - 1) / 3 + 1;

            var projects = await _context.Projects
                .Where(p => p.Status == ProjectStatus.Active ||
                          p.Status == ProjectStatus.InProgress ||
                          p.Status == ProjectStatus.Completed)
                .ToListAsync(cancellationToken);

            if (!projects.Any()) return new TotalRevenueActualDto { TotalRevenue = 0, ChangeDescription = "0% vs last quarter", ChangeType = "neutral", Currency = "USD" };

            var projectIds = projects.Select(p => p.Id).ToList();
            var progressReports = await _context.MonthlyProgresses
                .Include(mp => mp.ProgressDeliverables)
                .Where(mp => projectIds.Contains(mp.ProjectId))
                .ToListAsync(cancellationToken);

            var completedMilestones = progressReports
                .SelectMany(mp => mp.ProgressDeliverables ?? new List<ProgressDeliverable>())
                .Where(d => d.PaymentReceivedDate.HasValue)
                .ToList();

            var totalRevenueActual = completedMilestones.Sum(d => d.PaymentDue ?? 0);

            // Quarterly Changes
            var previousQuarter = currentQuarter == 1 ? 4 : currentQuarter - 1;
            var previousQuarterYear = currentQuarter == 1 ? currentYear - 1 : currentYear;

            var currentQuarterRev = completedMilestones
                .Where(d => d.PaymentReceivedDate.Value.Year == currentYear && 
                           ((d.PaymentReceivedDate.Value.Month - 1) / 3 + 1) == currentQuarter)
                .Sum(d => d.PaymentDue ?? 0);
            
            var prevQuarterRev = completedMilestones
                .Where(d => d.PaymentReceivedDate.Value.Year == previousQuarterYear && 
                           ((d.PaymentReceivedDate.Value.Month - 1) / 3 + 1) == previousQuarter)
                .Sum(d => d.PaymentDue ?? 0);

            var revenueChange = prevQuarterRev > 0 ? ((currentQuarterRev - prevQuarterRev) / prevQuarterRev) * 100 : 0;

            return new TotalRevenueActualDto
            {
                TotalRevenue = Math.Round(totalRevenueActual, 2),
                Currency = projects.FirstOrDefault()?.Currency,
                ChangeDescription = $"{revenueChange:F1}% vs last quarter",
                ChangeType = revenueChange > 0 ? "positive" : revenueChange < 0 ? "negative" : "neutral"
            };
        }
    }
}


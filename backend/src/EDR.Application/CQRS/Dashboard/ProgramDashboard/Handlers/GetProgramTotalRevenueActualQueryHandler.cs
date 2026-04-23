using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDR.Application.CQRS.Dashboard.ProgramDashboard.Queries;
using EDR.Repositories.Interfaces;
using EDR.Application.Dtos.ProgramDashboard;
using EDR.Domain.Entities;

namespace EDR.Application.CQRS.Dashboard.ProgramDashboard.Handlers
{
    public class GetProgramTotalRevenueActualQueryHandler : IRequestHandler<GetProgramTotalRevenueActualQuery, TotalRevenueActualDto>
    {
        private readonly IProgramDashboardRepository _programDashboardRepository;

        public GetProgramTotalRevenueActualQueryHandler(IProgramDashboardRepository programDashboardRepository)
        {
            _programDashboardRepository = programDashboardRepository;
        }

        public async Task<TotalRevenueActualDto> Handle(GetProgramTotalRevenueActualQuery request, CancellationToken cancellationToken)
        {
            var projects = await _programDashboardRepository.GetProjectsByProgramIdAsync(request.ProgramId, cancellationToken);
            if (!projects.Any()) return new TotalRevenueActualDto 
            { 
                TotalRevenue = 0, 
                ChangeDescription = "0% vs last quarter", 
                ChangeType = "neutral",
                CompletedMilestonesCount = 0
            };

            var projectIds = projects.Select(p => p.Id).ToList();
            var progressReports = await _programDashboardRepository.GetMonthlyProgressesByProjectIdsAsync(projectIds, cancellationToken);

            // Sum of all completed milestones (where payment has been received)
            var completedMilestones = progressReports
                .SelectMany(mp => (IEnumerable<ProgressDeliverable>?)mp.ProgressDeliverables ?? Array.Empty<ProgressDeliverable>())
                .Where(d => d.PaymentReceivedDate.HasValue)
                .ToList();

            var totalRevenueActual = completedMilestones.Sum(d => d.PaymentDue ?? 0);
            var completedMilestonesCount = completedMilestones.Count;

            // Quarterly Changes - based on milestones where payment was received in the respective quarter
            var currentDate = DateTime.Now;
            var currentYear = currentDate.Year;
            var currentMonth = currentDate.Month;
            var currentQuarter = (currentMonth - 1) / 3 + 1;
            
            var previousQuarter = currentQuarter == 1 ? 4 : currentQuarter - 1;
            var previousQuarterYear = currentQuarter == 1 ? currentYear - 1 : currentYear;

            var currentQuarterRev = progressReports
                .SelectMany(mp => (IEnumerable<ProgressDeliverable>?)mp.ProgressDeliverables ?? Array.Empty<ProgressDeliverable>())
                .Where(d => d.PaymentReceivedDate.HasValue && 
                           d.PaymentReceivedDate.Value.Year == currentYear && 
                           ((d.PaymentReceivedDate.Value.Month - 1) / 3 + 1) == currentQuarter)
                .Sum(d => d.PaymentDue ?? 0);
            
            var prevQuarterRev = progressReports
                .SelectMany(mp => (IEnumerable<ProgressDeliverable>?)mp.ProgressDeliverables ?? Array.Empty<ProgressDeliverable>())
                .Where(d => d.PaymentReceivedDate.HasValue && 
                           d.PaymentReceivedDate.Value.Year == previousQuarterYear && 
                           ((d.PaymentReceivedDate.Value.Month - 1) / 3 + 1) == previousQuarter)
                .Sum(d => d.PaymentDue ?? 0);

            var revChange = prevQuarterRev > 0 ? ((currentQuarterRev - prevQuarterRev) / prevQuarterRev) * 100 : 0;

            return new TotalRevenueActualDto
            {
                TotalRevenue = Math.Round(totalRevenueActual, 2),
                Currency = projects.FirstOrDefault()?.Currency,
                ChangeDescription = $"{revChange:F1}% vs last quarter",
                ChangeType = revChange > 0 ? "positive" : (revChange < 0 ? "negative" : "neutral"),
                CompletedMilestonesCount = completedMilestonesCount
            };
        }
    }
}

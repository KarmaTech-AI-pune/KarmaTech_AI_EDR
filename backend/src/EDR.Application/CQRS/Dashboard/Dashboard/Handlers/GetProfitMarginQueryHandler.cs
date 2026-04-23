using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDR.Application.CQRS.Dashboard.Dashboard.Queries;
using Microsoft.EntityFrameworkCore;
using EDR.Application.Dtos.Dashboard;
using EDR.Domain.Database;
using EDR.Domain.Entities;

namespace EDR.Application.CQRS.Dashboard.Dashboard.Handlers
{
    public class GetProfitMarginQueryHandler : IRequestHandler<GetProfitMarginQuery, ProfitMarginDto>
    {
        private readonly ProjectManagementContext _context;

        public GetProfitMarginQueryHandler(ProjectManagementContext context)
        {
            _context = context;
        }

        public async Task<ProfitMarginDto> Handle(GetProfitMarginQuery request, CancellationToken cancellationToken)
        {
            var projects = await _context.Projects
                .Where(p => p.Status == ProjectStatus.Active || 
                           p.Status == ProjectStatus.InProgress)
                .ToListAsync(cancellationToken);

            if (!projects.Any()) return new ProfitMarginDto
            {
                ExpectedProfitMargin = 0,
                ExpectedChangeDescription = "0.0% improvement",
                ExpectedChangeType = "neutral",
                ActualProfitMargin = 0,
                ActualChangeDescription = "0.0% improvement",
                ActualChangeType = "neutral"
            };

            var projectIds = projects.Select(p => p.Id).ToList();

            // Fetch Data
            var allJsf = await _context.JobStartForms
                .Where(jsf => projectIds.Contains(jsf.ProjectId))
                .ToListAsync(cancellationToken);

            var progressReports = await _context.MonthlyProgresses
                .Include(mp => mp.ContractAndCost)
                .Include(mp => mp.ProgressDeliverables)
                .Where(mp => projectIds.Contains(mp.ProjectId))
                .ToListAsync(cancellationToken);

            // 1. Calculate Expected Margin (Weighted)
            var latestJsfs = allJsf
                .GroupBy(jsf => jsf.ProjectId)
                .Select(g => g.OrderByDescending(jsf => jsf.CreatedDate).FirstOrDefault())
                .Where(jsf => jsf != null)
                .ToList();

            var totalExpectedRevenue = latestJsfs.Sum(jsf => jsf.TotalProjectFees);
            var totalExpectedProfit = latestJsfs.Sum(jsf => jsf.Profit);
            var expectedProfitMargin = totalExpectedRevenue > 0 ? (totalExpectedProfit / totalExpectedRevenue) * 100 : 0;

            // 2. Calculate Actual Margin (Weighted)
            decimal totalActualRevenue = 0;
            decimal totalActualCost = 0;

            foreach (var projectId in projectIds)
            {
                var projectReports = progressReports.Where(mp => mp.ProjectId == projectId).ToList();
                if (!projectReports.Any()) continue;

                var latestReport = projectReports
                    .OrderByDescending(mp => mp.Year)
                    .ThenByDescending(mp => mp.Month)
                    .FirstOrDefault();

                if (latestReport == null) continue;

                var projectRevenue = projectReports
                    .SelectMany(mp => mp.ProgressDeliverables ?? new List<ProgressDeliverable>())
                    .Where(d => d.PaymentReceivedDate.HasValue)
                    .Sum(d => d.PaymentDue ?? 0);

                var projectCost = latestReport.ContractAndCost?.TotalCumulativeCost ?? 0;
                
                totalActualRevenue += projectRevenue;
                totalActualCost += projectCost;
            }

            var totalActualProfit = totalActualRevenue - totalActualCost;
            var actualProfitMargin = totalActualRevenue > 0 ? (totalActualProfit / totalActualRevenue) * 100 : 0;

            // 3. Quarterly Changes logic
            var currentDate = DateTime.Now;
            var currentYear = currentDate.Year;
            var currentMonth = currentDate.Month;
            var currentQuarter = (currentMonth - 1) / 3 + 1;
            var previousQuarter = currentQuarter == 1 ? 4 : currentQuarter - 1;
            var previousQuarterYear = currentQuarter == 1 ? currentYear - 1 : currentYear;

            // Expected Quarterly Logic
            var curQJsfs = allJsf.Where(jsf => jsf.CreatedDate.Year == currentYear && ((jsf.CreatedDate.Month - 1) / 3 + 1) == currentQuarter).ToList();
            var prevQJsfs = allJsf.Where(jsf => jsf.CreatedDate.Year == previousQuarterYear && ((jsf.CreatedDate.Month - 1) / 3 + 1) == previousQuarter).ToList();

            var curQExpRev = curQJsfs.Sum(j => j.TotalProjectFees);
            var curQExpProfit = curQJsfs.Sum(j => j.Profit);
            var curQExpMargin = curQExpRev > 0 ? (curQExpProfit / curQExpRev) * 100 : 0;

            var prevQExpRev = prevQJsfs.Sum(j => j.TotalProjectFees);
            var prevQExpProfit = prevQJsfs.Sum(j => j.Profit);
            var prevQExpMargin = prevQExpRev > 0 ? (prevQExpProfit / prevQExpRev) * 100 : 0;

            var expectedChange = prevQExpMargin > 0 ? ((curQExpMargin - prevQExpMargin) / prevQExpMargin) * 100 : 0;

            // Actual Quarterly Logic
            decimal curQActRev = 0;
            decimal curQActCost = 0;
            decimal prevQActRev = 0;
            decimal prevQActCost = 0;

            foreach (var mp in progressReports)
            {
                var isCurrentQ = mp.Year == currentYear && ((mp.Month - 1) / 3 + 1) == currentQuarter;
                var isPrevQ = mp.Year == previousQuarterYear && ((mp.Month - 1) / 3 + 1) == previousQuarter;

                if (!isCurrentQ && !isPrevQ) continue;

                var revInQ = (mp.ProgressDeliverables ?? new List<ProgressDeliverable>())
                    .Where(d => d.PaymentReceivedDate.HasValue && 
                                d.PaymentReceivedDate.Value.Year == mp.Year && 
                                ((d.PaymentReceivedDate.Value.Month - 1) / 3 + 1) == ((mp.Month - 1) / 3 + 1))
                    .Sum(d => d.PaymentDue ?? 0);
                
                var costInQ = mp.ContractAndCost?.ActualSubtotal ?? 0;

                if (isCurrentQ) { curQActRev += revInQ; curQActCost += costInQ; }
                if (isPrevQ) { prevQActRev += revInQ; prevQActCost += costInQ; }
            }

            var curQActProfit = curQActRev - curQActCost;
            var prevQActProfit = prevQActRev - prevQActCost;
            var curQActMargin = curQActRev > 0 ? (curQActProfit / curQActRev) * 100 : 0;
            var prevQActMargin = prevQActRev > 0 ? (prevQActProfit / prevQActRev) * 100 : 0;

            var actualChange = prevQActMargin > 0 ? ((curQActMargin - prevQActMargin) / prevQActMargin) * 100 : 0;

            return new ProfitMarginDto
            {
                ProfitMargin = actualProfitMargin, // Legacy
                ExpectedProfitMargin = Math.Round(expectedProfitMargin, 2),
                ExpectedChangeDescription = $"{expectedChange:F1}% improvement",
                ExpectedChangeType = expectedChange > 0 ? "positive" : (expectedChange < 0 ? "negative" : "neutral"),
                
                ActualProfitMargin = Math.Round(actualProfitMargin, 2),
                ActualChangeDescription = $"{actualChange:F1}% improvement",
                ActualChangeType = actualChange > 0 ? "positive" : (actualChange < 0 ? "negative" : "neutral"),

                // Legacy fields
                ChangeDescription = $"{actualChange:F1}% improvement",
                ChangeType = actualChange > 0 ? "positive" : (actualChange < 0 ? "negative" : "neutral")
            };
        }
    }
}

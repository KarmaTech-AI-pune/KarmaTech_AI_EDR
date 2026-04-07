using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDR.Application.CQRS.Dashboard.Dashboard.Queries;
using Microsoft.EntityFrameworkCore;
using EDR.Application.Dtos.Dashboard;
using EDR.Domain.Database;
using EDR.Domain.Entities;
using EDR.Domain.Enums; // Added for ProjectStatusEnum

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
            // Helper method for calculating total revenue expected
            var totalRevenue = await _context.JobStartForms
                .Include(jsf => jsf.Project)
                .Where(jsf => jsf.Project.Status == ProjectStatus.Active ||
                              jsf.Project.Status == ProjectStatus.InProgress)
                .Where(jsf => jsf.Project.StartDate.HasValue &&
                              jsf.Project.StartDate.Value.Year == DateTime.Now.Year)
                .SumAsync(jsf => jsf.TotalProjectFees, cancellationToken);

            var totalCost = await _context.MonthlyProgresses
                .Include(mp => mp.Project)
                .Include(mp => mp.ContractAndCost)
                .Where(mp => mp.Project.Status == ProjectStatus.Active ||
                             mp.Project.Status == ProjectStatus.InProgress ||
                             mp.Project.Status == ProjectStatus.Completed)
                .Where(mp => mp.Year == DateTime.Now.Year)
                .SumAsync(mp => mp.ContractAndCost.TotalCumulativeCost ?? 0m, cancellationToken);

            var profitMargin = totalRevenue > 0
                ? Math.Round(((totalRevenue - totalCost) / totalRevenue) * 100, 2)
                : 0;

            // For comparison, calculate previous quarter's margin
            var previousQuarterMargin = await CalculatePreviousQuarterProfitMargin(cancellationToken);

            var change = profitMargin - previousQuarterMargin;

            return new ProfitMarginDto
            {
                ProfitMargin = profitMargin,
                ChangeDescription = $"{change:F1}% improvement",
                ChangeType = change > 0 ? "positive" : change < 0 ? "negative" : "neutral"
            };
        }

        private async Task<decimal> CalculatePreviousQuarterProfitMargin(CancellationToken cancellationToken)
        {
            var currentDate = DateTime.Now;
            var currentYear = currentDate.Year;
            var currentMonth = currentDate.Month;

            var previousQuarter = (currentMonth - 1) / 3;
            var previousQuarterYear = previousQuarter == 0 ? currentYear - 1 : currentYear;
            var previousQuarterMonth = previousQuarter == 0 ? 12 : previousQuarter * 3;

            var prevQuarterRevenue = await _context.JobStartForms
                .Include(jsf => jsf.Project)
                .Where(jsf => jsf.Project.Status == ProjectStatus.Active ||
                              jsf.Project.Status == ProjectStatus.InProgress)
                .Where(jsf => jsf.Project.StartDate.HasValue &&
                              jsf.Project.StartDate.Value.Year == previousQuarterYear &&
                              ((jsf.Project.StartDate.Value.Month - 1) / 3 + 1) == previousQuarter)
                .SumAsync(jsf => jsf.TotalProjectFees, cancellationToken);

            var prevQuarterCost = await _context.MonthlyProgresses
                .Include(mp => mp.Project)
                .Include(mp => mp.ContractAndCost)
                .Where(mp => mp.Project.Status == ProjectStatus.Active ||
                             mp.Project.Status == ProjectStatus.InProgress ||
                             mp.Project.Status == ProjectStatus.Completed)
                .Where(mp => mp.Year == previousQuarterYear && mp.Month <= previousQuarterMonth)
                .SumAsync(mp => mp.ContractAndCost.TotalCumulativeCost ?? 0m, cancellationToken);

            return prevQuarterRevenue > 0
                ? ((prevQuarterRevenue - prevQuarterCost) / prevQuarterRevenue) * 100
                : 0;
        }
    }
}


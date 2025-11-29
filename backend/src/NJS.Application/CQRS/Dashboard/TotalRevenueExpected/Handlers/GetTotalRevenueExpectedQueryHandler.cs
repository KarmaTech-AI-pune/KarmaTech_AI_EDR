using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using NJS.Application.DTOs.Dashboard;
using NJS.Domain.Database;
using NJS.Domain.Entities;

namespace NJS.Application.CQRS.Dashboard.TotalRevenueExpected.Handlers
{
    public class GetTotalRevenueExpectedQueryHandler : IRequestHandler<Queries.GetTotalRevenueExpectedQuery, TotalRevenueExpectedDto>
    {
        private readonly ProjectManagementContext _context;
        private readonly ILogger<GetTotalRevenueExpectedQueryHandler> _logger;

        public GetTotalRevenueExpectedQueryHandler(ProjectManagementContext context, ILogger<GetTotalRevenueExpectedQueryHandler> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<TotalRevenueExpectedDto> Handle(Queries.GetTotalRevenueExpectedQuery request, CancellationToken cancellationToken)
        {
            var currentDate = DateTime.Now;
            var currentYear = currentDate.Year;
            var currentMonth = currentDate.Month;

            var currentQuarter = (currentMonth - 1) / 3 + 1;
            var previousQuarter = currentQuarter == 1 ? 4 : currentQuarter - 1;
            var previousQuarterYear = currentQuarter == 1 ? currentYear - 1 : currentYear;

            _logger.LogInformation("Dashboard Revenue Calculation - Current Year: {CurrentYear}, Current Quarter: {CurrentQuarter}, Previous Quarter: {PreviousQuarter}, Previous Quarter Year: {PreviousQuarterYear}", 
                currentYear, currentQuarter, previousQuarter, previousQuarterYear);

            // Diagnostic: Check total JobStartForms and their properties
            var totalFormsCount = await _context.JobStartForms.CountAsync(cancellationToken);
            var formsWithProject = await _context.JobStartForms
                .Include(jsf => jsf.Project)
                .ToListAsync(cancellationToken);

            _logger.LogInformation("Total JobStartForms in database: {TotalFormsCount}", totalFormsCount);

            if (formsWithProject.Any())
            {
                foreach (var form in formsWithProject.Take(5)) // Log first 5 forms for diagnosis
                {
                    _logger.LogInformation("Form ID: {FormId}, CreatedDate: {CreatedDate}, Year: {Year}, TotalProjectFees: {TotalProjectFees}, Project Status: {ProjectStatus}", 
                        form.FormId, form.CreatedDate, form.CreatedDate.Year, form.TotalProjectFees, form.Project?.Status);
                }
            }

            var totalRevenueExpected = await _context.JobStartForms
                .Include(jsf => jsf.Project)
                .Where(jsf => jsf.Project.Status == ProjectStatus.Active ||
                              jsf.Project.Status == ProjectStatus.InProgress)
                .Where(jsf => jsf.CreatedDate.Year == currentYear)
                .SumAsync(jsf => jsf.TotalProjectFees, cancellationToken);

            var currentQuarterRevenueExpected = await _context.JobStartForms
                .Include(jsf => jsf.Project)
                .Where(jsf => jsf.Project.Status == ProjectStatus.Active ||
                              jsf.Project.Status == ProjectStatus.InProgress)
                .Where(jsf => jsf.CreatedDate.Year == currentYear &&
                              ((jsf.CreatedDate.Month - 1) / 3 + 1) == currentQuarter)
                .SumAsync(jsf => jsf.TotalProjectFees, cancellationToken);

            var previousQuarterRevenueExpected = await _context.JobStartForms
                .Include(jsf => jsf.Project)
                .Where(jsf => jsf.Project.Status == ProjectStatus.Active ||
                              jsf.Project.Status == ProjectStatus.InProgress)
                .Where(jsf => jsf.CreatedDate.Year == previousQuarterYear &&
                              ((jsf.CreatedDate.Month - 1) / 3 + 1) == previousQuarter)
                .SumAsync(jsf => jsf.TotalProjectFees, cancellationToken);

            _logger.LogInformation("Calculated Total Revenue Expected: {TotalRevenueExpected}, Current Quarter Revenue: {CurrentQuarterRevenue}, Previous Quarter Revenue: {PreviousQuarterRevenueExpected}", 
                totalRevenueExpected, currentQuarterRevenueExpected, previousQuarterRevenueExpected);

            var revenueChange = previousQuarterRevenueExpected > 0
                ? ((currentQuarterRevenueExpected - previousQuarterRevenueExpected) / previousQuarterRevenueExpected) * 100
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

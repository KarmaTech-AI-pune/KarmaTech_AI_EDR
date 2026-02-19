using MediatR;
using NJS.Application.DTOs;
using NJS.Domain.Entities;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using NJS.Application.CQRS.Cashflow.Queries;
using Microsoft.EntityFrameworkCore;
using NJS.Domain.Database;
using System;

namespace NJS.Application.CQRS.Cashflow.Handlers
{
    public class GetAllCashflowsQueryHandler : IRequestHandler<Queries.GetAllCashflowsQuery, List<CashflowDto>>
    {
        private readonly ProjectManagementContext _context;

        public GetAllCashflowsQueryHandler(ProjectManagementContext context)
        {
            _context = context;
        }

        public async Task<List<CashflowDto>> Handle(Queries.GetAllCashflowsQuery request, CancellationToken cancellationToken)
        {
            // Get WBS data for the project
            var wbsData = await _context.WBSHeaders
                .Where(h => h.ProjectId == request.ProjectId)
                .SelectMany(h => h.WorkBreakdownStructures)
                .SelectMany(wbs => wbs.Tasks)
                .Include(t => t.PlannedHours)
                .Where(t => !t.IsDeleted)
                .ToListAsync(cancellationToken);

            if (!wbsData.Any())
            {
                // No WBS data found, return empty list
                return new List<CashflowDto>();
            }

            // Get all unique year-month combinations from PlannedHours
            var allPeriods = wbsData
                .SelectMany(t => t.PlannedHours)
                .Select(ph => new { Year = ph.Year, Month = ParseMonth(ph.Month) })
                .Where(p => p.Month > 0) // Valid month
                .Distinct()
                .OrderBy(p => int.Parse(p.Year))
                .ThenBy(p => p.Month)
                .ToList();

            if (!allPeriods.Any())
            {
                // No planned hours data, return empty list
                return new List<CashflowDto>();
            }

            // Group WBS tasks by TaskType
            var manpowerTasks = wbsData.Where(t => t.TaskType == TaskType.Manpower).ToList();
            var odcTasks = wbsData.Where(t => t.TaskType == TaskType.ODC).ToList();

            // Get project details for revenue calculation
            var project = await _context.Projects
                .FirstOrDefaultAsync(p => p.Id == request.ProjectId, cancellationToken);

            var jobStartForm = await _context.JobStartForms
                .FirstOrDefaultAsync(j => j.ProjectId == request.ProjectId, cancellationToken);

            decimal totalProjectFee = jobStartForm?.TotalProjectFees ?? project?.EstimatedProjectFee ?? 0;

            // Calculate total months for revenue distribution
            int totalMonths = allPeriods.Count;
            decimal monthlyRevenue = totalMonths > 0 ? totalProjectFee / totalMonths : 0;

            var cashflowList = new List<CashflowDto>();
            decimal cumulativeCost = 0;

            foreach (var period in allPeriods)
            {
                int year = int.Parse(period.Year);
                int month = period.Month;
                string yearStr = period.Year;

                // Calculate Personnel Cost from Manpower WBS Tasks
                decimal personnelCost = 0;
                decimal totalHours = 0;

                foreach (var task in manpowerTasks)
                {
                    var monthlyHours = task.PlannedHours
                        .Where(ph => ph.Year == yearStr && ParseMonth(ph.Month) == month)
                        .Sum(ph => ph.ActualHours ?? ph.PlannedHours);
                    
                    totalHours += (decimal)monthlyHours;
                    personnelCost += (decimal)monthlyHours * task.EstimatedBudget;
                }

                // Calculate ODC Cost from ODC WBS Tasks
                decimal odcCost = 0;

                foreach (var task in odcTasks)
                {
                    var monthlyHours = task.PlannedHours
                        .Where(ph => ph.Year == yearStr && ParseMonth(ph.Month) == month)
                        .Sum(ph => ph.ActualHours ?? ph.PlannedHours);
                    
                    totalHours += (decimal)monthlyHours;
                    odcCost += (decimal)monthlyHours * task.EstimatedBudget;
                }

                // Total Costs = Personnel + ODC
                decimal totalCosts = personnelCost + odcCost;

                // Update cumulative cost
                cumulativeCost += totalCosts;

                // Net Cash Flow = Revenue - Total Costs
                decimal netCashFlow = monthlyRevenue - totalCosts;

                // Status: Planned (since we're calculating from WBS, not actual progress)
                string status = "Planned";

                // Format Period "MMM-yy" e.g., "Jan-25"
                string periodFormatted = new DateTime(year, month, 1).ToString("MMM-yy");

                cashflowList.Add(new CashflowDto
                {
                    ProjectId = request.ProjectId,
                    Month = periodFormatted,
                    Hours = (int)totalHours,
                    PersonnelCost = personnelCost,
                    OdcCost = odcCost,
                    TotalProjectCost = totalCosts,
                    CumulativeCost = cumulativeCost,
                    Revenue = monthlyRevenue,
                    CashFlow = netCashFlow,
                    Status = status
                });
            }

            return cashflowList;
        }

        private int ParseMonth(string monthStr)
        {
            // Try to parse month string to int
            if (int.TryParse(monthStr, out int m) && m >= 1 && m <= 12)
            {
                return m;
            }

            // Try to parse month name (e.g., "Jan", "January")
            var monthNames = System.Globalization.CultureInfo.InvariantCulture.DateTimeFormat;
            for (int i = 1; i <= 12; i++)
            {
                if (string.Equals(monthStr, monthNames.GetAbbreviatedMonthName(i), StringComparison.OrdinalIgnoreCase) ||
                    string.Equals(monthStr, monthNames.GetMonthName(i), StringComparison.OrdinalIgnoreCase))
                {
                    return i;
                }
            }

            return 0; // Invalid month
        }
    }
}

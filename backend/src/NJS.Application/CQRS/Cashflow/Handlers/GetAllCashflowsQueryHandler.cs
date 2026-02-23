using MediatR;
using NJS.Application.Dtos;
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
    public class GetAllCashflowsQueryHandler : IRequestHandler<Queries.GetAllCashflowsQuery, MonthlyBudgetResponseDto>
    {
        private readonly ProjectManagementContext _context;
        private readonly IMediator _mediator;

        public GetAllCashflowsQueryHandler(ProjectManagementContext context, IMediator mediator)
        {
            _context = context;
            _mediator = mediator;
        }

        public async Task<MonthlyBudgetResponseDto> Handle(Queries.GetAllCashflowsQuery request, CancellationToken cancellationToken)
        {
            // Get project details
            var project = await _context.Projects
                .FirstOrDefaultAsync(p => p.Id == request.ProjectId, cancellationToken);

            if (project == null)
            {
                return new MonthlyBudgetResponseDto
                {
                    ProjectName = "Unknown Project",
                    Cashflows = new List<CashflowDto>(),
                    Summary = new MonthlyBudgetSummaryDto()
                };
            }

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
                return new MonthlyBudgetResponseDto
                {
                    ProjectName = project.Name ?? "Unknown Project",
                    Cashflows = new List<CashflowDto>(),
                    Summary = new MonthlyBudgetSummaryDto()
                };
            }

            // Get all unique year-month combinations from PlannedHours
            var allPeriods = wbsData
                .SelectMany(t => t.PlannedHours)
                .Select(ph => new { Year = ph.Year, Month = ParseMonth(ph.Month) })
                .Where(p => p.Month > 0)
                .Distinct()
                .OrderBy(p => int.Parse(p.Year))
                .ThenBy(p => p.Month)
                .ToList();

            if (!allPeriods.Any())
            {
                return new MonthlyBudgetResponseDto
                {
                    ProjectName = project.Name ?? "Unknown Project",
                    Cashflows = new List<CashflowDto>(),
                    Summary = new MonthlyBudgetSummaryDto()
                };
            }

            // Group WBS tasks by TaskType
            var manpowerTasks = wbsData.Where(t => t.TaskType == TaskType.Manpower).ToList();
            var odcTasks = wbsData.Where(t => t.TaskType == TaskType.ODC).ToList();

            // Get JobStartForm for hourly rate fallback
            var jobStartForm = await _context.JobStartForms
                .FirstOrDefaultAsync(j => j.ProjectId == request.ProjectId, cancellationToken);

            // Get payment milestones for revenue calculation using the existing query
            var paymentMilestones = await _mediator.Send(new GetPaymentMilestonesQuery(request.ProjectId), cancellationToken);

            // Create a dictionary for milestone revenue by month
            var revenueByMonth = new Dictionary<string, decimal>();
            foreach (var milestone in paymentMilestones)
            {
                // Parse the DueDate string (format: "2025-03-15")
                if (!string.IsNullOrEmpty(milestone.DueDate) && milestone.AmountINR > 0)
                {
                    try
                    {
                        // Parse ISO date format "2025-03-15"
                        var date = DateTime.Parse(milestone.DueDate);
                        string milestoneMonth = date.ToString("MMM-yy"); // "Mar-25"
                            
                        if (revenueByMonth.ContainsKey(milestoneMonth))
                        {
                            revenueByMonth[milestoneMonth] += milestone.AmountINR;
                        }
                        else
                        {
                            revenueByMonth[milestoneMonth] = milestone.AmountINR;
                        }
                    }
                    catch
                    {
                        // Skip invalid date formats
                        continue;
                    }
                }
            }

            var cashflowList = new List<CashflowDto>();
            decimal cumulativeCost = 0;
            decimal cumulativeRevenue = 0;

            // Default hourly rate if EstimatedBudget is not available
            decimal defaultHourlyRate = 100m; // Can be configured

            foreach (var period in allPeriods)
            {
                int year = int.Parse(period.Year);
                int month = period.Month;
                string yearStr = period.Year;

                // Format Period "MMM-yy" e.g., "Jan-25"
                string periodFormatted = new DateTime(year, month, 1).ToString("MMM-yy");

                // Calculate Personnel Cost from Manpower WBS Tasks
                decimal personnelCost = 0;
                decimal totalHours = 0;

                foreach (var task in manpowerTasks)
                {
                    var monthlyHours = task.PlannedHours
                        .Where(ph => ph.Year == yearStr && ParseMonth(ph.Month) == month)
                        .Sum(ph => ph.ActualHours ?? ph.PlannedHours);
                    
                    totalHours += (decimal)monthlyHours;
                    
                    // Use EstimatedBudget if available, otherwise use default rate
                    decimal hourlyRate = task.EstimatedBudget > 0 ? task.EstimatedBudget : defaultHourlyRate;
                    personnelCost += (decimal)monthlyHours * hourlyRate;
                }

                // Calculate ODC Cost from ODC WBS Tasks
                decimal odcCost = 0;

                foreach (var task in odcTasks)
                {
                    var monthlyHours = task.PlannedHours
                        .Where(ph => ph.Year == yearStr && ParseMonth(ph.Month) == month)
                        .Sum(ph => ph.ActualHours ?? ph.PlannedHours);
                    
                    totalHours += (decimal)monthlyHours;
                    
                    // Use EstimatedBudget if available, otherwise use default rate
                    decimal hourlyRate = task.EstimatedBudget > 0 ? task.EstimatedBudget : defaultHourlyRate;
                    odcCost += (decimal)monthlyHours * hourlyRate;
                }

                // Total Costs = Personnel + ODC
                decimal totalCosts = personnelCost + odcCost;

                // Update cumulative cost
                cumulativeCost += totalCosts;

                // Get revenue for this month from payment milestones
                decimal monthlyRevenue = revenueByMonth.ContainsKey(periodFormatted) 
                    ? revenueByMonth[periodFormatted] 
                    : 0;

                // Update cumulative revenue
                cumulativeRevenue += monthlyRevenue;

                // Cash Flow = Cumulative Revenue - Cumulative Cost
                decimal cashFlow = cumulativeRevenue - cumulativeCost;

                // Status: Planned (since we're calculating from WBS, not actual progress)
                string status = "Planned";

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
                    CumulativeRevenue = cumulativeRevenue,
                    CashFlow = cashFlow,
                    Status = status
                });
            }

            // Calculate Summary Data
            decimal totalPersonnelCost = cashflowList.Sum(c => c.PersonnelCost ?? 0);
            decimal totalODCCost = cashflowList.Sum(c => c.OdcCost ?? 0);
            decimal totalCost = totalPersonnelCost + totalODCCost;

            // Calculate contingencies
            decimal manpowerContingency = totalPersonnelCost * 0.20m; // 20%
            decimal odcContingency = totalODCCost * 0.10m; // 10%
            decimal subTotal = totalCost + manpowerContingency + odcContingency;

            // Calculate profit and GST
            decimal profit = subTotal * 0.16m; // 16%
            decimal totalProjectCost = subTotal + profit;
            decimal gst = totalProjectCost * 0.18m; // 18%
            decimal quotedPrice = totalProjectCost + gst;

            var summary = new MonthlyBudgetSummaryDto
            {
                PureManpowerCost = totalPersonnelCost,
                OtherODC = totalODCCost,
                Total = totalCost,
                ManpowerContingencies = new ContingencyDto
                {
                    Percentage = 20,
                    Amount = manpowerContingency
                },
                OdcContingencies = new ContingencyDto
                {
                    Percentage = 10,
                    Amount = odcContingency
                },
                SubTotal = subTotal,
                Profit = new ContingencyDto
                {
                    Percentage = 16,
                    Amount = profit
                },
                TotalProjectCost = totalProjectCost,
                GST = new ContingencyDto
                {
                    Percentage = 18,
                    Amount = gst
                },
                QuotedPrice = quotedPrice
            };

            return new MonthlyBudgetResponseDto
            {
                ProjectName = project.Name ?? "Unknown Project",
                Cashflows = cashflowList,
                Summary = summary
            };
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

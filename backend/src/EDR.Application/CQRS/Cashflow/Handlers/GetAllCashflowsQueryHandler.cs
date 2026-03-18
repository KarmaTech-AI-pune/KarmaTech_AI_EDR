using MediatR;
using EDR.Application.Dtos;
using EDR.Domain.Entities;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using EDR.Application.CQRS.Cashflow.Queries;
using Microsoft.EntityFrameworkCore;
using EDR.Domain.Database;
using System;

namespace EDR.Application.CQRS.Cashflow.Handlers
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
            try
            {
                // Get project details
                var project = await _context.Projects
                    .FirstOrDefaultAsync(p => p.Id == request.ProjectId, cancellationToken);

                if (project == null)
                {
                    // Return null to indicate no data available
                    return null;
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
                    // Return null to indicate no data available
                    return null;
                }

                // Get all unique year-month combinations from PlannedHours
                var allPeriods = wbsData
                    .SelectMany(t => t.PlannedHours ?? new List<WBSTaskPlannedHour>())
                    .Select(ph => new { Year = ph.Year, Month = ParseMonth(ph.Month) })
                    .Where(p => p.Month > 0)
                    .Distinct()
                    .OrderBy(p => int.Parse(p.Year))
                    .ThenBy(p => p.Month)
                    .ToList();

                if (!allPeriods.Any())
                {
                    // Return null to indicate no data available
                    return null;
                }

                // Group WBS tasks by TaskType
                var manpowerTasks = wbsData.Where(t => t.TaskType == TaskType.Manpower).ToList();
                var odcTasks = wbsData.Where(t => t.TaskType == TaskType.ODC).ToList();

                // Get JobStartForm for hourly rate fallback
                var jobStartForm = await _context.JobStartForms
                    .FirstOrDefaultAsync(j => j.ProjectId == request.ProjectId, cancellationToken);

                // Get payment milestones from PaymentSchedule (Payment Milestone table)
                var paymentMilestones = await _context.PaymentMilestones
                    .Where(pm => pm.ProjectId == request.ProjectId)
                    .ToListAsync(cancellationToken);

                // Log payment milestones for debugging
                Console.WriteLine($"=== REVENUE CALCULATION DEBUG START ===");
                Console.WriteLine($"Project ID: {request.ProjectId}");
                Console.WriteLine($"Total payment milestones in DB: {paymentMilestones.Count}");
                Console.WriteLine($"Payment milestones with AmountINR > 0: {paymentMilestones.Count(pm => pm.AmountINR > 0)}");
                
                if (paymentMilestones.Count == 0)
                {
                    Console.WriteLine($"WARNING: No payment milestones found for project {request.ProjectId}");
                    Console.WriteLine($"Revenue will be 0 for all months");
                }
                else
                {
                    Console.WriteLine($"Found {paymentMilestones.Count} payment milestones:");
                }
                
                foreach (var milestone in paymentMilestones)
                {
                    Console.WriteLine($"Payment Milestone Details:");
                    Console.WriteLine($"  - ID: {milestone.Id}");
                    Console.WriteLine($"  - Description: {milestone.Description}");
                    Console.WriteLine($"  - Amount INR: {milestone.AmountINR}");
                    Console.WriteLine($"  - Due Date (raw): '{milestone.DueDate}'");
                    Console.WriteLine($"  - Due Date IsNullOrEmpty: {string.IsNullOrEmpty(milestone.DueDate)}");
                    Console.WriteLine($"  - Percentage: {milestone.Percentage}");
                }

                // Create a dictionary for milestone revenue by month
                var revenueByMonth = new Dictionary<string, decimal>();
                foreach (var milestone in paymentMilestones)
                {
                    Console.WriteLine($"\nProcessing milestone: {milestone.Description}");
                    Console.WriteLine($"  - Due Date: '{milestone.DueDate}'");
                    Console.WriteLine($"  - Amount INR: {milestone.AmountINR}");
                    
                    // Skip if amount is 0 or negative
                    if (milestone.AmountINR <= 0)
                    {
                        Console.WriteLine($"  - SKIPPED: Amount INR is 0 or negative");
                        continue;
                    }
                    
                    // Skip if DueDate is null or empty
                    if (string.IsNullOrEmpty(milestone.DueDate))
                    {
                        Console.WriteLine($"  - SKIPPED: DueDate is null or empty");
                        continue;
                    }
                    
                    try
                    {
                        // Try to parse DueDate - support multiple formats
                        DateTime dueDate;
                        bool parsed = DateTime.TryParse(milestone.DueDate, out dueDate);
                        
                        if (!parsed)
                        {
                            // Try parsing with specific formats
                            string[] formats = { 
                                "yyyy-MM-dd", 
                                "MM/dd/yyyy", 
                                "dd/MM/yyyy",
                                "yyyy/MM/dd",
                                "MMM-yy",
                                "MMM-yyyy"
                            };
                            
                            foreach (var format in formats)
                            {
                                if (DateTime.TryParseExact(milestone.DueDate, format, 
                                    System.Globalization.CultureInfo.InvariantCulture, 
                                    System.Globalization.DateTimeStyles.None, out dueDate))
                                {
                                    parsed = true;
                                    Console.WriteLine($"  - Parsed with format: {format}");
                                    break;
                                }
                            }
                        }
                        
                        if (parsed)
                        {
                            string milestoneMonth = dueDate.ToString("MMM-yy"); // "Mar-24"
                            
                            Console.WriteLine($"  - Parsed Date: {dueDate:yyyy-MM-dd}");
                            Console.WriteLine($"  - Formatted month: {milestoneMonth}");
                            
                            if (revenueByMonth.ContainsKey(milestoneMonth))
                            {
                                revenueByMonth[milestoneMonth] += milestone.AmountINR;
                                Console.WriteLine($"  - Added to existing month. New total: {revenueByMonth[milestoneMonth]}");
                            }
                            else
                            {
                                revenueByMonth[milestoneMonth] = milestone.AmountINR;
                                Console.WriteLine($"  - Created new month entry. Total: {revenueByMonth[milestoneMonth]}");
                            }
                        }
                        else
                        {
                            Console.WriteLine($"  - ERROR: Could not parse DueDate: '{milestone.DueDate}' with any known format");
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"  - ERROR processing milestone: {ex.Message}");
                        Console.WriteLine($"  - Stack trace: {ex.StackTrace}");
                        continue;
                    }
                }
                
                Console.WriteLine($"Revenue by month dictionary has {revenueByMonth.Count} entries");
                foreach (var kvp in revenueByMonth)
                {
                    Console.WriteLine($"  Month: {kvp.Key}, Total Revenue: {kvp.Value}");
                }
                Console.WriteLine($"=== REVENUE CALCULATION DEBUG END ===");

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
                        var monthlyHours = (task.PlannedHours ?? new List<WBSTaskPlannedHour>())
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
                        var monthlyHours = (task.PlannedHours ?? new List<WBSTaskPlannedHour>())
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

                    // Log revenue calculation for debugging
                    Console.WriteLine($"Month: {periodFormatted}, Revenue: {monthlyRevenue}, Cumulative Revenue: {cumulativeRevenue}, Cash Flow: {cashFlow}");

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
            catch (Exception ex)
            {
                // Log the error and return null
                // Note: In production, you should use proper logging
                Console.WriteLine($"Error in GetAllCashflowsQueryHandler: {ex.Message}");
                Console.WriteLine($"StackTrace: {ex.StackTrace}");
                
                // Return null to indicate error
                return null;
            }
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

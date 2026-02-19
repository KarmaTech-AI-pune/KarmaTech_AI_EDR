using MediatR;
using NJS.Application.DTOs;
using NJS.Domain.Entities;
using NJS.Repositories.Interfaces;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using NJS.Application.CQRS.Cashflow.Queries;
using Microsoft.EntityFrameworkCore;
using NJS.Domain.Database;

namespace NJS.Application.CQRS.Cashflow.Handlers
{
    public class GetAllCashflowsQueryHandler : IRequestHandler<Queries.GetAllCashflowsQuery, List<CashflowDto>>
    {
        private readonly IMonthlyProgressRepository _monthlyProgressRepository;
        private readonly ProjectManagementContext _context;

        public GetAllCashflowsQueryHandler(
            IMonthlyProgressRepository monthlyProgressRepository,
            ProjectManagementContext context)
        {
            _monthlyProgressRepository = monthlyProgressRepository;
            _context = context;
        }


        public async Task<List<CashflowDto>> Handle(Queries.GetAllCashflowsQuery request, CancellationToken cancellationToken)
        {
            var monthlyProgresses = await _monthlyProgressRepository.GetByProjectIdAsync(request.ProjectId);
            
            // Sort by Year then Month
            monthlyProgresses = monthlyProgresses.OrderBy(mp => mp.Year).ThenBy(mp => mp.Month).ToList();

            // Get WBS data for the project
            var wbsData = await _context.WBSHeaders
                .Where(h => h.ProjectId == request.ProjectId)
                .SelectMany(h => h.WorkBreakdownStructures)
                .SelectMany(wbs => wbs.Tasks)
                .Include(t => t.PlannedHours)
                .ToListAsync(cancellationToken);

            // Group WBS tasks by TaskType (Manpower = 0, ODC = 1)
            var manpowerTasks = wbsData.Where(t => t.TaskType == TaskType.Manpower && !t.IsDeleted).ToList();
            var odcTasks = wbsData.Where(t => t.TaskType == TaskType.ODC && !t.IsDeleted).ToList();

            return monthlyProgresses.Select(mp => 
            {
                // Get month and year for filtering
                int year = mp.Year;
                int month = mp.Month;
                string yearStr = year.ToString();

                // Calculate Personnel Cost from Manpower WBS Tasks
                decimal personnelCost = 0;
                decimal totalHours = 0; // Track total hours
                foreach (var task in manpowerTasks)
                {
                    var monthlyHours = task.PlannedHours
                        .Where(ph => ph.Year == yearStr && IsMonthMatch(ph.Month, month))
                        .Sum(ph => ph.ActualHours ?? ph.PlannedHours);
                    
                    totalHours += (decimal)monthlyHours;
                    
                    // Use EstimatedBudget as cost per hour/unit
                    personnelCost += (decimal)monthlyHours * task.EstimatedBudget;
                }

                // Calculate ODC Cost from ODC WBS Tasks
                decimal odcCost = 0;
                foreach (var task in odcTasks)
                {
                    var monthlyHours = task.PlannedHours
                        .Where(ph => ph.Year == yearStr && IsMonthMatch(ph.Month, month))
                        .Sum(ph => ph.ActualHours ?? ph.PlannedHours);
                    
                    totalHours += (decimal)monthlyHours;
                    
                    // Use EstimatedBudget as cost per unit
                    odcCost += (decimal)monthlyHours * task.EstimatedBudget;
                }

                // Total Costs = Personnel + ODC
                decimal totalCosts = personnelCost + odcCost;

                // Calculate Revenue from BudgetTable -> OriginalBudget -> RevenueFee
                decimal revenue = mp.BudgetTable?.OriginalBudget?.RevenueFee ?? 0;

                // Net Cash Flow = Revenue - Total Costs
                decimal netCashFlow = revenue - totalCosts;

                // Status Logic: Check if any deliverable has been paid
                bool isCompleted = false;
                if (mp.ProgressDeliverables != null && mp.ProgressDeliverables.Any())
                {
                    isCompleted = mp.ProgressDeliverables.Any(pd => 
                        pd.PaymentReceivedDate.HasValue && 
                        pd.PaymentReceivedDate.Value < System.DateTime.Now);
                }
                
                string status = isCompleted ? "Completed" : "Planned";
                
                // Format Period "MMM-yy" e.g., "Jan-25"
                string period = new System.DateTime(mp.Year, mp.Month, 1).ToString("MMM-yy");

                // Calculate cumulative cost
                decimal cumulativeCost = monthlyProgresses
                    .Where(m => m.Year < year || (m.Year == year && m.Month <= month))
                    .Sum(m => {
                        // Recalculate costs for each month for cumulative
                        decimal monthPersonnel = 0;
                        decimal monthOdc = 0;
                        string mYearStr = m.Year.ToString();
                        
                        foreach (var task in manpowerTasks)
                        {
                            var hrs = task.PlannedHours
                                .Where(ph => ph.Year == mYearStr && IsMonthMatch(ph.Month, m.Month))
                                .Sum(ph => ph.ActualHours ?? ph.PlannedHours);
                            monthPersonnel += (decimal)hrs * task.EstimatedBudget;
                        }
                        
                        foreach (var task in odcTasks)
                        {
                            var hrs = task.PlannedHours
                                .Where(ph => ph.Year == mYearStr && IsMonthMatch(ph.Month, m.Month))
                                .Sum(ph => ph.ActualHours ?? ph.PlannedHours);
                            monthOdc += (decimal)hrs * task.EstimatedBudget;
                        }
                        
                        return monthPersonnel + monthOdc;
                    });

                return new CashflowDto
                {
                    Id = mp.Id,
                    ProjectId = mp.ProjectId,
                    Month = period,
                    
                    // Total Hours from WBS tasks
                    Hours = (int)totalHours,
                    
                    // Personnel Cost from WBS Manpower tasks
                    PersonnelCost = personnelCost,
                    
                    // ODC Cost from WBS ODC tasks
                    OdcCost = odcCost,
                    
                    // Total Costs
                    TotalProjectCost = totalCosts,
                    
                    // Cumulative Cost
                    CumulativeCost = cumulativeCost,
                    
                    // Revenue
                    Revenue = revenue,
                    
                    // Net Cash Flow
                    CashFlow = netCashFlow,

                    // Status
                    Status = status
                };
            }).ToList();
        }

        private bool IsMonthMatch(string monthStr, int monthInt)
        {
            // Try to parse month string to int
            if (int.TryParse(monthStr, out int m))
            {
                return m == monthInt;
            }

            // Try to parse month name (e.g., "Jan", "January")
            var monthNames = System.Globalization.CultureInfo.InvariantCulture.DateTimeFormat;
            for (int i = 1; i <= 12; i++)
            {
                if (string.Equals(monthStr, monthNames.GetAbbreviatedMonthName(i), System.StringComparison.OrdinalIgnoreCase) ||
                    string.Equals(monthStr, monthNames.GetMonthName(i), System.StringComparison.OrdinalIgnoreCase))
                {
                    return i == monthInt;
                }
            }

            return false;
        }
    }
}

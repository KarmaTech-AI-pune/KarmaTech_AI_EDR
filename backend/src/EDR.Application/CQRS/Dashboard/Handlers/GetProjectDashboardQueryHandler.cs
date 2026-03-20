using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using EDR.Application.Dtos.Dashboard;
using EDR.Domain.Database;
using EDR.Domain.Entities;
using EDR.Domain.Enums;

namespace EDR.Application.CQRS.Dashboard.Handlers
{
    public class GetProjectDashboardQueryHandler : IRequestHandler<GetProjectDashboardQuery, ProjectDashboardDto>
    {
        private readonly ProjectManagementContext _context;

        public GetProjectDashboardQueryHandler(ProjectManagementContext context)
        {
            _context = context;
        }

        public async Task<ProjectDashboardDto> Handle(GetProjectDashboardQuery request, CancellationToken cancellationToken)
        {
            var project = await _context.Projects
                .FirstOrDefaultAsync(p => p.Id == request.ProjectId, cancellationToken);

            if (project == null)
            {
                return null;
            }

            // --- 1. Basic Metrics & Quarterly Changes ---
            var currentDate = DateTime.Now;
            var currentYear = currentDate.Year;
            var currentMonth = currentDate.Month;
            var currentQuarter = (currentMonth - 1) / 3 + 1;
            
            var previousQuarter = currentQuarter == 1 ? 4 : currentQuarter - 1;
            var previousQuarterYear = currentQuarter == 1 ? currentYear - 1 : currentYear;

            var allJsf = await _context.JobStartForms
                .Include(jsf => jsf.Header)
                    .ThenInclude(h => h.JobStartFormHistories)
                .Where(jsf => jsf.ProjectId == request.ProjectId && !jsf.IsDeleted)
                .ToListAsync(cancellationToken);

            var totalRevenueExpected = allJsf.Sum(jsf => jsf.TotalProjectFees);
            var totalRevenueActual = allJsf.Sum(jsf => jsf.ProjectFees);
            var profitMargin = allJsf.Any() ? allJsf.Average(jsf => jsf.ProfitPercentage) : 0;

            // Quarterly Revenue Change
            var currentQuarterRev = allJsf
                .Where(jsf => jsf.CreatedDate.Year == currentYear && ((jsf.CreatedDate.Month - 1) / 3 + 1) == currentQuarter)
                .Sum(jsf => jsf.TotalProjectFees);
            
            var prevQuarterRev = allJsf
                .Where(jsf => jsf.CreatedDate.Year == previousQuarterYear && ((jsf.CreatedDate.Month - 1) / 3 + 1) == previousQuarter)
                .Sum(jsf => jsf.TotalProjectFees);

            var revChange = prevQuarterRev > 0 ? ((currentQuarterRev - prevQuarterRev) / prevQuarterRev) * 100 : 0;

            // Quarterly Profit Margin Change
            var currentQuarterProfit = allJsf
                .Where(jsf => jsf.CreatedDate.Year == currentYear && ((jsf.CreatedDate.Month - 1) / 3 + 1) == currentQuarter)
                .Select(jsf => jsf.ProfitPercentage).DefaultIfEmpty(0).Average();
            
            var prevQuarterProfit = allJsf
                .Where(jsf => jsf.CreatedDate.Year == previousQuarterYear && ((jsf.CreatedDate.Month - 1) / 3 + 1) == previousQuarter)
                .Select(jsf => jsf.ProfitPercentage).DefaultIfEmpty(0).Average();

            var profitChange = prevQuarterProfit > 0 ? ((currentQuarterProfit - prevQuarterProfit) / prevQuarterProfit) * 100 : 0;

            // --- 2. NPV & What-If ---
            decimal currentNpv = totalRevenueExpected; // Main dashboard uses total fees as NPV baseline
            double totalApprovalDelayDays = 0;
            int approvalHistoriesCount = 0;

            foreach (var form in allJsf)
            {
                if (form.Header?.JobStartFormHistories != null)
                {
                    var histories = form.Header.JobStartFormHistories.OrderBy(h => h.ActionDate).ToList();
                    var sent = histories.FirstOrDefault(h => h.StatusId == (int)PMWorkflowStatusEnum.SentForApproval);
                    var approved = histories.FirstOrDefault(h => h.StatusId == (int)PMWorkflowStatusEnum.Approved && (sent == null || h.ActionDate > sent.ActionDate));

                    if (sent != null && approved != null)
                    {
                        var delay = (approved.ActionDate - sent.ActionDate).TotalDays;
                        if (delay > 0)
                        {
                            totalApprovalDelayDays += delay;
                            approvalHistoriesCount++;
                        }
                    }
                }
            }

            string whatIf = "Not enough history for NPV simulation";
            if (approvalHistoriesCount > 0)
            {
                double avgDelay = totalApprovalDelayDays / approvalHistoriesCount;
                decimal estimatedGain = totalRevenueExpected * 0.10m * (decimal)((avgDelay * 0.5) / 365.0);
                whatIf = estimatedGain > 0 
                    ? $"If approval delays reduced by 50%, project NPV could increase by {estimatedGain:C0}"
                    : "Approval cycle is efficient; minimal NPV impact projected.";
            }

            // --- 3. Budget Health ---
            var budgetTotal = project.EstimatedProjectCost ?? 0;
            var budgetSpent = allJsf.Sum(jsf => jsf.TotalExpenses);
            var budgetPercentage = budgetTotal > 0 ? (double)(budgetSpent / budgetTotal * 100) : 0;

            // --- 4. Pending Forms (JSF, Manpower, ODC, Closure, Change Control) ---
            var pendingForms = new List<PendingFormDto>();

            // 1. Job Start Forms
            var jobStartForms = await _context.JobStartForms
                .Include(jsf => jsf.Header)
                    .ThenInclude(header => header.JobStartFormHistories)
                        .ThenInclude(hist => hist.AssignedTo)
                .Where(jsf => jsf.ProjectId == request.ProjectId && (jsf.Header == null || jsf.Header.StatusId != (int)PMWorkflowStatusEnum.Approved))
                .Select(jsf => new PendingFormDto
                {
                    FormType = "JobStartForm",
                    FormId = jsf.FormId,
                    ProjectId = jsf.ProjectId,
                    StatusId = jsf.Header == null ? 0 : jsf.Header.StatusId,
                    FormName = jsf.FormTitle,
                    ProjectName = project.Name,
                    HoldingUserName = jsf.Header != null && jsf.Header.JobStartFormHistories.Any() 
                        ? jsf.Header.JobStartFormHistories.OrderByDescending(h => h.ActionDate).FirstOrDefault().AssignedTo.Name
                        : "Internal Process"
                })
                .ToListAsync(cancellationToken);
            pendingForms.AddRange(jobStartForms);

            // 2 & 3. WBS (Manpower & ODC) via Planned Hour Headers
            var wbsPlannedHourForms = await _context.WBSTaskPlannedHourHeaders
                .Include(wbsph => wbsph.WBSHistories)
                    .ThenInclude(hist => hist.AssignedTo)
                .Where(wbsph => wbsph.ProjectId == request.ProjectId && wbsph.StatusId != (int)PMWorkflowStatusEnum.Approved)
                .Select(wbsph => new PendingFormDto
                {
                    FormType = (wbsph.TaskType == TaskType.Manpower) ? "Manpower" : (wbsph.TaskType == TaskType.ODC) ? "ODC" : "WBSPlannedHour",
                    FormId = wbsph.Id,
                    ProjectId = wbsph.ProjectId,
                    StatusId = wbsph.StatusId,
                    FormName = (wbsph.TaskType == TaskType.Manpower) ? "Manpower Task" : (wbsph.TaskType == TaskType.ODC) ? "ODC Task" : "WBS Planned Hour",
                    ProjectName = project.Name,
                    HoldingUserName = (wbsph.WBSHistories != null && wbsph.WBSHistories.Any(h => h.AssignedTo != null)) 
                        ? wbsph.WBSHistories.Where(h => h.AssignedTo != null).OrderByDescending(h => h.ActionDate).FirstOrDefault().AssignedTo.Name 
                        : "Internal Process"
                })
                .ToListAsync(cancellationToken);
            pendingForms.AddRange(wbsPlannedHourForms);

            // 4. Project Closures
            var projectClosures = await _context.ProjectClosures
                .Include(pc => pc.WorkflowHistories)
                    .ThenInclude(hist => hist.AssignedTo)
                .Where(pc => pc.ProjectId == request.ProjectId && pc.WorkflowStatusId != (int)PMWorkflowStatusEnum.Approved)
                .Select(pc => new PendingFormDto
                {
                    FormType = "ProjectClosure",
                    FormId = pc.Id,
                    ProjectId = pc.ProjectId,
                    StatusId = pc.WorkflowStatusId,
                    FormName = "Project Closure",
                    ProjectName = project.Name,
                    HoldingUserName = pc.WorkflowHistories != null && pc.WorkflowHistories.Any()
                        ? pc.WorkflowHistories.OrderByDescending(h => h.ActionDate).FirstOrDefault().AssignedTo.Name
                        : "Internal Process"
                })
                .ToListAsync(cancellationToken);
            pendingForms.AddRange(projectClosures);

            // 5. Change Controls
            var changeControls = await _context.ChangeControls
                .Include(cc => cc.WorkflowHistories)
                    .ThenInclude(hist => hist.AssignedTo)
                .Where(cc => cc.ProjectId == request.ProjectId && cc.WorkflowStatusId != (int)PMWorkflowStatusEnum.Approved)
                .Select(cc => new PendingFormDto
                {
                    FormType = "ChangeControl",
                    FormId = cc.Id,
                    ProjectId = cc.ProjectId,
                    StatusId = cc.WorkflowStatusId,
                    FormName = "Change Control",
                    ProjectName = project.Name,
                    HoldingUserName = cc.WorkflowHistories != null && cc.WorkflowHistories.Any()
                        ? cc.WorkflowHistories.OrderByDescending(h => h.ActionDate).FirstOrDefault().AssignedTo.Name
                        : "Internal Process"
                })
                .ToListAsync(cancellationToken);
            pendingForms.AddRange(changeControls);

            // --- 5. Milestones ---
            var latestMonthlyProgress = await _context.MonthlyProgresses
                .Include(mp => mp.ProgressDeliverables)
                .Where(mp => mp.ProjectId == request.ProjectId)
                .OrderByDescending(mp => mp.Year).ThenByDescending(mp => mp.Month)
                .FirstOrDefaultAsync(cancellationToken);

            var milestones = latestMonthlyProgress?.ProgressDeliverables?.Select(d => new MilestoneBillingDto
            {
                Id = d.Id,
                Project = project.Name,
                Milestone = d.Milestone ?? "Deliverable",
                ExpectedAmount = d.PaymentDue ?? 0,
                Status = d.PaymentReceivedDate.HasValue ? "Completed" : (d.DueDateContract < DateTime.UtcNow ? "Overdue" : "On Track"),
                DaysDelayed = d.PaymentReceivedDate.HasValue && d.DueDateContract.HasValue 
                    ? (d.PaymentReceivedDate.Value - d.DueDateContract.Value).Days 
                    : (d.DueDateContract < DateTime.UtcNow ? (DateTime.UtcNow - d.DueDateContract.Value).Days : 0),
                Penalty = 0
            }).ToList() ?? new List<MilestoneBillingDto>();

            // --- 6. Improved Cashflow (Planned vs Actual) ---
            var plannedHours = await (from ph in _context.WBSTaskPlannedHours
                                     join t in _context.WBSTasks on ph.WBSTaskId equals t.Id
                                     join wbs in _context.WorkBreakdownStructures on t.WorkBreakdownStructureId equals wbs.Id
                                     join header in _context.WBSHeaders on wbs.WBSHeaderId equals header.Id
                                     where header.ProjectId == request.ProjectId && !t.IsDeleted
                                     select new { ph.Month, ph.Year, ph.PlannedHours })
                                     .ToListAsync(cancellationToken);

            var projectTotalPlannedHours = plannedHours.Sum(ph => ph.PlannedHours);
            
            var monthlyProgress = await _context.MonthlyProgresses
                .Include(mp => mp.FinancialDetails)
                .Where(mp => mp.ProjectId == request.ProjectId)
                .ToListAsync(cancellationToken);

            var allMonths = new HashSet<(int Year, int Month)>();
            foreach (var ph in plannedHours) { if (int.TryParse(ph.Year, out int y) && TryParseMonth(ph.Month, out int m)) allMonths.Add((y, m)); }
            foreach (var mp in monthlyProgress) { allMonths.Add((mp.Year, mp.Month)); }

            var cashflow = allMonths.OrderBy(x => x.Year).ThenBy(x => x.Month).Select(mo => {
                var monthPlannedHours = plannedHours
                    .Where(ph => ph.Year == mo.Year.ToString() && IsSameMonth(ph.Month, mo.Month))
                    .Sum(ph => ph.PlannedHours);
                
                decimal plannedRev = projectTotalPlannedHours > 0 ? (decimal)((monthPlannedHours / projectTotalPlannedHours) * (double)totalRevenueExpected) : 0;
                decimal actualRev = monthlyProgress.Where(mp => mp.Year == mo.Year && mp.Month == mo.Month).Sum(mp => mp.FinancialDetails?.FeeTotal ?? 0);

                return new MonthlyCashflowDto {
                    Month = CultureInfo.CurrentCulture.DateTimeFormat.GetAbbreviatedMonthName(mo.Month),
                    Planned = Math.Round(plannedRev, 2),
                    Actual = Math.Round(actualRev, 2),
                    Variance = Math.Round(actualRev - plannedRev, 2)
                };
            }).ToList();

            if (!cashflow.Any())
            {
                var now = DateTime.Now;
                for (int i = 5; i >= 0; i--) {
                    var date = now.AddMonths(-i);
                    cashflow.Add(new MonthlyCashflowDto { Month = date.ToString("MMM"), Planned = 0, Actual = 0, Variance = 0 });
                }
            }

            // --- 7. Regional Portfolio (for single project) ---
            var regionalPortfolio = new List<RegionalPortfolioDto>();
            if (!string.IsNullOrEmpty(project.Region))
            {
                int q1 = IsActiveInQuarter(project.StartDate, project.EndDate, currentYear, 1) ? 1 : 0;
                int q2 = IsActiveInQuarter(project.StartDate, project.EndDate, currentYear, 2) ? 1 : 0;
                int q3 = IsActiveInQuarter(project.StartDate, project.EndDate, currentYear, 3) ? 1 : 0;
                int q4 = IsActiveInQuarter(project.StartDate, project.EndDate, currentYear, 4) ? 1 : 0;

                regionalPortfolio.Add(new RegionalPortfolioDto
                {
                    Region = project.Region,
                    Revenue = Math.Round(totalRevenueExpected, 2),
                    Profit = Math.Round((decimal)profitMargin, 2),
                    Q1 = q1,
                    Q2 = q2,
                    Q3 = q3,
                    Q4 = q4
                });
            }

            return new ProjectDashboardDto
            {
                ProjectId = project.Id,
                ProjectName = project.Name,
                TotalRevenueExpected = Math.Round(totalRevenueExpected, 2),
                RevenueChangeDescription = $"{revChange:F1}% vs last quarter",
                RevenueChangeType = revChange > 0 ? "positive" : (revChange < 0 ? "negative" : "neutral"),
                TotalRevenueActual = Math.Round(totalRevenueActual, 2),
                ProfitMargin = Math.Round((decimal)profitMargin, 2),
                ProfitMarginChangeDescription = $"{profitChange:F1}% vs last quarter",
                ProfitMarginChangeType = profitChange > 0 ? "positive" : (profitChange < 0 ? "negative" : "neutral"),
                CurrentNpv = Math.Round(currentNpv, 2),
                WhatIfAnalysis = whatIf,
                BudgetTotal = Math.Round(budgetTotal, 2),
                BudgetSpent = Math.Round(budgetSpent, 2),
                BudgetPercentage = Math.Round(budgetPercentage, 2),
                PendingForms = pendingForms,
                Milestones = milestones,
                MonthlyCashflow = cashflow,
                RegionalPortfolio = regionalPortfolio,
                ProjectsAtRisk = await GetProjectsAtRiskForProject(project.Id, cancellationToken)
            };
        }

        private async Task<List<ProjectAtRiskDto>> GetProjectsAtRiskForProject(int projectId, CancellationToken ct)
        {
            var p = await _context.Projects
                .Include(p => p.ProjectManager)
                .FirstOrDefaultAsync(p => p.Id == projectId, ct);

            if (p == null) return new List<ProjectAtRiskDto>();

            // Only consider if status is relevant
            if (p.Status != ProjectStatus.OnHold && 
                p.Status != ProjectStatus.Active &&
                p.Status != ProjectStatus.Opportunity)
            {
                return new List<ProjectAtRiskDto>();
            }

            var schedule = await _context.Schedules
                .Where(s => s.MonthlyProgress.ProjectId == p.Id)
                .OrderByDescending(s => s.MonthlyProgress.Year)
                .ThenByDescending(s => s.MonthlyProgress.Month)
                .FirstOrDefaultAsync(ct);

            // Calculate delay
            int delayDays = 0;
            if (schedule?.CompletionDateAsPerContract != null)
            {
                var compareDate = schedule.ExpectedCompletionDate ?? DateTime.Now;
                delayDays = (int)(compareDate - schedule.CompletionDateAsPerContract.Value).TotalDays;
            }

            // Calculate budget
            var budgetTotal = p.EstimatedProjectCost;
            var budgetSpent = await _context.ContractAndCosts
                .Where(cc => cc.MonthlyProgress.ProjectId == p.Id)
                .OrderByDescending(cc => cc.MonthlyProgress.Year)
                .ThenByDescending(cc => cc.MonthlyProgress.Month)
                .Select(cc => cc.TotalCumulativeCost ?? 0m)
                .FirstOrDefaultAsync(ct);

            var budgetPercentage = budgetTotal > 0
                ? (int)((budgetSpent / budgetTotal) * 100)
                : 0;

            // Determine status
            string riskStatus = "on_track";
            var issues = new List<string>();

            if (delayDays > 15)
            {
                riskStatus = "falling_behind";
                issues.Add($"Delayed by {delayDays} days");
            }

            if (budgetPercentage > 85 && p.Progress < 70)
            {
                riskStatus = "cost_overrun";
                issues.Add("Budget overrun risk");
            }
            
            var hasScopeChange = await _context.ChangeControls
                .AnyAsync(cc => cc.ProjectId == p.Id && cc.WorkflowStatusId == (int)PMWorkflowStatusEnum.SentForApproval, ct);

            if (hasScopeChange)
            {
                riskStatus = "scope_issue";
                issues.Add("Pending scope changes");
            }

            var projectsList = new List<ProjectAtRiskDto>();

            // Only include if actually at risk
            if (delayDays > 5 || budgetPercentage > 80 || hasScopeChange)
            {
                projectsList.Add(new ProjectAtRiskDto
                {
                    ProjectId = p.Id,
                    ProjectName = p.Name,
                    Priority = delayDays > 15 ? "P3" : "P5",
                    Region = p.Region,
                    Status = riskStatus,
                    DelayDays = delayDays,
                    BudgetSpent = budgetSpent,
                    BudgetTotal = budgetTotal ?? 0,
                    BudgetPercentage = budgetPercentage,
                    Issues = issues,
                    Manager = p.ProjectManager?.Name ?? "Unknown"
                });
            }

            return projectsList;
        }

        private bool TryParseMonth(string monthStr, out int month)
        {
            month = 0; if (string.IsNullOrWhiteSpace(monthStr)) return false;
            if (int.TryParse(monthStr, out int m) && m >= 1 && m <= 12) { month = m; return true; }
            string[] formats = { "MMM", "MMMM" };
            if (DateTime.TryParseExact(monthStr, formats, CultureInfo.InvariantCulture, DateTimeStyles.None, out DateTime dt)) { month = dt.Month; return true; }
            for (int i = 1; i <= 12; i++) {
                if (string.Equals(monthStr, CultureInfo.InvariantCulture.DateTimeFormat.GetAbbreviatedMonthName(i), StringComparison.OrdinalIgnoreCase) ||
                    string.Equals(monthStr, CultureInfo.InvariantCulture.DateTimeFormat.GetMonthName(i), StringComparison.OrdinalIgnoreCase)) { month = i; return true; }
            }
            return false;
        }

        private bool IsSameMonth(string monthStr, int monthInt)
        {
            if (TryParseMonth(monthStr, out int m)) return m == monthInt;
            return false;
        }

        private bool IsActiveInQuarter(DateTime? startDate, DateTime? endDate, int year, int quarter)
        {
            if (!startDate.HasValue) return false;

            DateTime qStart = new DateTime(year, (quarter - 1) * 3 + 1, 1);
            DateTime qEnd = qStart.AddMonths(3).AddDays(-1);

            DateTime start = startDate.Value;
            DateTime end = endDate ?? DateTime.MaxValue;

            return start <= qEnd && end >= qStart;
        }
    }
}

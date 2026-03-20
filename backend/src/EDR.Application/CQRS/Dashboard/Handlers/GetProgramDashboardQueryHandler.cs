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
    public class GetProgramDashboardQueryHandler : IRequestHandler<GetProgramDashboardQuery, ProgramDashboardDto>
    {
        private readonly ProjectManagementContext _context;

        public GetProgramDashboardQueryHandler(ProjectManagementContext context)
        {
            _context = context;
        }

        public async Task<ProgramDashboardDto> Handle(GetProgramDashboardQuery request, CancellationToken cancellationToken)
        {
            try
            {
                Console.WriteLine($"[GetProgramDashboardQueryHandler] Handling request for ProgramId: {request.ProgramId}");
                
                var program = await _context.Programs
                    .FirstOrDefaultAsync(p => p.Id == request.ProgramId, cancellationToken);

                if (program == null)
                {
                    Console.WriteLine($"[GetProgramDashboardQueryHandler] Program not found for Id: {request.ProgramId}");
                    return null;
                }

                Console.WriteLine($"[GetProgramDashboardQueryHandler] Program found: {program.Name}. Fetching projects...");

                var projects = await _context.Projects
                    .Where(p => p.ProgramId == request.ProgramId)
                    .ToListAsync(cancellationToken);

                Console.WriteLine($"[GetProgramDashboardQueryHandler] Found {projects.Count} projects for program.");

                var projectIds = projects.Select(p => p.Id).ToList();

            // --- 1. Aggregated Metrics & Quarterly Changes ---
            var currentDate = DateTime.Now;
            var currentYear = currentDate.Year;
            var currentMonth = currentDate.Month;
            var currentQuarter = (currentMonth - 1) / 3 + 1;
            
            var previousQuarter = currentQuarter == 1 ? 4 : currentQuarter - 1;
            var previousQuarterYear = currentQuarter == 1 ? currentYear - 1 : currentYear;

            var allJsf = await _context.JobStartForms
                .Include(jsf => jsf.Header)
                    .ThenInclude(h => h.JobStartFormHistories)
                .Where(jsf => projectIds.Contains(jsf.ProjectId) && !jsf.IsDeleted)
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
                .Select(jsf => (double)jsf.ProfitPercentage).DefaultIfEmpty(0).Average();
            
            var prevQuarterProfit = allJsf
                .Where(jsf => jsf.CreatedDate.Year == previousQuarterYear && ((jsf.CreatedDate.Month - 1) / 3 + 1) == previousQuarter)
                .Select(jsf => (double)jsf.ProfitPercentage).DefaultIfEmpty(0).Average();

            var profitChange = prevQuarterProfit > 0 ? ((currentQuarterProfit - prevQuarterProfit) / prevQuarterProfit) * 100 : 0;

            // --- 2. Budget Health ---
            var budgetTotal = projects.Sum(p => p.EstimatedProjectCost ?? 0);
            var budgetSpent = allJsf.Sum(jsf => jsf.TotalExpenses);
            var budgetPercentage = budgetTotal > 0 ? (double)(budgetSpent / budgetTotal * 100) : 0;

            // --- 3. Status Distribution ---
            var statusDistribution = projects
                .GroupBy(p => p.Status)
                .Select(g => new ProjectStatusCountDto
                {
                    Status = g.Key.ToString(),
                    Count = g.Count()
                })
                .ToList();

            // --- 4. Pending Forms ---
            var pendingForms = new List<PendingFormDto>();
            
            var jobStartForms = await _context.JobStartForms
                .Include(jsf => jsf.Header)
                    .ThenInclude(header => header.JobStartFormHistories)
                        .ThenInclude(hist => hist.AssignedTo)
                .Join(_context.Projects, jsf => jsf.ProjectId, p => p.Id, (jsf, p) => new { jsf, p })
                .Where(x => projectIds.Contains(x.jsf.ProjectId) && (x.jsf.Header == null || x.jsf.Header.StatusId != (int)PMWorkflowStatusEnum.Approved))
                .Select(x => new PendingFormDto
                {
                    FormType = "JobStartForm",
                    FormId = x.jsf.FormId,
                    ProjectId = x.jsf.ProjectId,
                    StatusId = x.jsf.Header == null ? 0 : x.jsf.Header.StatusId,
                    FormName = x.jsf.FormTitle,
                    ProjectName = x.p.Name,
                    HoldingUserName = x.jsf.Header != null && x.jsf.Header.JobStartFormHistories.Any() 
                        ? (x.jsf.Header.JobStartFormHistories.OrderByDescending(h => h.ActionDate).Select(h => h.AssignedTo.Name).FirstOrDefault() ?? "Pending")
                        : "Internal Process"
                })
                .ToListAsync(cancellationToken);
            pendingForms.AddRange(jobStartForms);

            // 2 & 3. WBS (Manpower & ODC) via Planned Hour Headers
            var wbsPlannedHourForms = await _context.WBSTaskPlannedHourHeaders
                .Include(wbsph => wbsph.WBSHistories)
                    .ThenInclude(hist => hist.AssignedTo)
                .Join(_context.Projects, w => w.ProjectId, p => p.Id, (w, p) => new { w, p })
                .Where(x => projectIds.Contains(x.w.ProjectId) && x.w.StatusId != (int)PMWorkflowStatusEnum.Approved)
                .Select(x => new PendingFormDto
                {
                    FormType = (x.w.TaskType == TaskType.Manpower) ? "Manpower" : (x.w.TaskType == TaskType.ODC) ? "ODC" : "WBSPlannedHour",
                    FormId = x.w.Id,
                    ProjectId = x.w.ProjectId,
                    StatusId = x.w.StatusId,
                    FormName = (x.w.TaskType == TaskType.Manpower) ? "Manpower Task" : (x.w.TaskType == TaskType.ODC) ? "ODC Task" : "WBS Planned Hour",
                    ProjectName = x.p.Name,
                    HoldingUserName = (x.w.WBSHistories != null && x.w.WBSHistories.Any(h => h.AssignedTo != null)) 
                        ? x.w.WBSHistories.Where(h => h.AssignedTo != null).OrderByDescending(h => h.ActionDate).FirstOrDefault().AssignedTo.Name 
                        : "Internal Process"
                })
                .ToListAsync(cancellationToken);
            pendingForms.AddRange(wbsPlannedHourForms);

            // 4. Project Closures
            var projectClosures = await _context.ProjectClosures
                .Include(pc => pc.WorkflowHistories)
                    .ThenInclude(hist => hist.AssignedTo)
                .Join(_context.Projects, pc => pc.ProjectId, p => p.Id, (pc, p) => new { pc, p })
                .Where(x => projectIds.Contains(x.pc.ProjectId) && x.pc.WorkflowStatusId != (int)PMWorkflowStatusEnum.Approved)
                .Select(x => new PendingFormDto
                {
                    FormType = "ProjectClosure",
                    FormId = x.pc.Id,
                    ProjectId = x.pc.ProjectId,
                    StatusId = x.pc.WorkflowStatusId,
                    FormName = "Project Closure",
                    ProjectName = x.p.Name,
                    HoldingUserName = x.pc.WorkflowHistories != null && x.pc.WorkflowHistories.Any()
                        ? x.pc.WorkflowHistories.OrderByDescending(h => h.ActionDate).FirstOrDefault().AssignedTo.Name
                        : "Internal Process"
                })
                .ToListAsync(cancellationToken);
            pendingForms.AddRange(projectClosures);

            // 5. Change Controls
            var changeControls = await _context.ChangeControls
                .Include(cc => cc.WorkflowHistories)
                    .ThenInclude(hist => hist.AssignedTo)
                .Join(_context.Projects, cc => cc.ProjectId, p => p.Id, (cc, p) => new { cc, p })
                .Where(x => projectIds.Contains(x.cc.ProjectId) && x.cc.WorkflowStatusId != (int)PMWorkflowStatusEnum.Approved)
                .Select(x => new PendingFormDto
                {
                    FormType = "ChangeControl",
                    FormId = x.cc.Id,
                    ProjectId = x.cc.ProjectId,
                    StatusId = x.cc.WorkflowStatusId,
                    FormName = "Change Control",
                    ProjectName = x.p.Name,
                    HoldingUserName = x.cc.WorkflowHistories != null && x.cc.WorkflowHistories.Any()
                        ? x.cc.WorkflowHistories.OrderByDescending(h => h.ActionDate).FirstOrDefault().AssignedTo.Name
                        : "Internal Process"
                })
                .ToListAsync(cancellationToken);
            pendingForms.AddRange(changeControls);

            // --- 5. Milestones ---
            var milestones = await _context.MonthlyProgresses
                .Include(mp => mp.ProgressDeliverables)
                .Join(_context.Projects, mp => mp.ProjectId, p => p.Id, (mp, p) => new { mp, p })
                .Where(x => projectIds.Contains(x.mp.ProjectId))
                .OrderByDescending(x => x.mp.Year).ThenByDescending(x => x.mp.Month)
                .SelectMany(x => x.mp.ProgressDeliverables.Select(d => new MilestoneBillingDto
                {
                    Id = d.Id,
                    Project = x.p.Name,
                    Milestone = d.Milestone ?? "Deliverable",
                    ExpectedAmount = d.PaymentDue ?? 0,
                    Status = d.PaymentReceivedDate.HasValue ? "Completed" : (d.DueDateContract < DateTime.UtcNow ? "Overdue" : "On Track"),
                    DaysDelayed = d.PaymentReceivedDate.HasValue && d.DueDateContract.HasValue 
                        ? (d.PaymentReceivedDate.Value - d.DueDateContract.Value).Days 
                        : (d.DueDateContract < DateTime.UtcNow ? (DateTime.UtcNow - (d.DueDateContract ?? DateTime.UtcNow)).Days : 0),
                    Penalty = 0
                }))
                .Take(10) 
                .ToListAsync(cancellationToken);

            // --- 6. Aggregated Cashflow ---
            var plannedHours = await (from ph in _context.WBSTaskPlannedHours
                                     join t in _context.WBSTasks on ph.WBSTaskId equals t.Id
                                     join wbs in _context.WorkBreakdownStructures on t.WorkBreakdownStructureId equals wbs.Id
                                     join header in _context.WBSHeaders on wbs.WBSHeaderId equals header.Id
                                     where projectIds.Contains(header.ProjectId) && !t.IsDeleted
                                     select new { ph.Month, ph.Year, ph.PlannedHours, header.ProjectId })
                                     .ToListAsync(cancellationToken);

            var monthlyProgress = await _context.MonthlyProgresses
                .Include(mp => mp.FinancialDetails)
                .Where(mp => projectIds.Contains(mp.ProjectId))
                .ToListAsync(cancellationToken);

            var allMonths = new HashSet<(int Year, int Month)>();
            foreach (var ph in plannedHours) { if (int.TryParse(ph.Year, out int y) && TryParseMonth(ph.Month, out int m)) allMonths.Add((y, m)); }
            foreach (var mp in monthlyProgress) { allMonths.Add((mp.Year, mp.Month)); }

            var cashflow = allMonths.OrderBy(x => x.Year).ThenBy(x => x.Month).Select(mo => {
                decimal totalPlannedRev = 0;
                foreach(var pid in projectIds)
                {
                    var projPlannedHoursData = plannedHours.Where(ph => ph.ProjectId == pid).ToList();
                    var projPlannedHoursTotal = projPlannedHoursData.Sum(x => x.PlannedHours);
                    if (projPlannedHoursTotal == 0) continue;

                    var monthProjHours = projPlannedHoursData
                        .Where(ph => ph.Year == mo.Year.ToString() && IsSameMonth(ph.Month, mo.Month))
                        .Sum(ph => ph.PlannedHours);
                    
                    var projTotalRevExpected = allJsf.Where(jsf => jsf.ProjectId == pid).Sum(jsf => jsf.TotalProjectFees);
                    totalPlannedRev += (decimal)((monthProjHours / projPlannedHoursTotal) * (double)projTotalRevExpected);
                }

                decimal actualRev = monthlyProgress.Where(mp => mp.Year == mo.Year && mp.Month == mo.Month).Sum(mp => mp.FinancialDetails?.FeeTotal ?? 0);

                return new MonthlyCashflowDto {
                    Month = CultureInfo.CurrentCulture.DateTimeFormat.GetAbbreviatedMonthName(mo.Month),
                    Planned = Math.Round(totalPlannedRev, 2),
                    Actual = Math.Round(actualRev, 2),
                    Variance = Math.Round(actualRev - totalPlannedRev, 2)
                };
            }).ToList();

            // --- 7. NPV & What-If ---
            decimal currentNpv = 0;
            int highProfitCount = 0;
            int mediumProfitCount = 0;
            int lowProfitCount = 0;
            
            double totalApprovalDelayDays = 0;
            int projectsWithApprovalHistory = 0;
            decimal totalProjectFeesForDelayedProjects = 0;

            foreach (var form in allJsf)
            {
                currentNpv += form.TotalProjectFees;
                var formProfitMargin = form.ProfitPercentage;

                if (formProfitMargin >= 20) highProfitCount++;
                else if (formProfitMargin >= 10) mediumProfitCount++;
                else if (formProfitMargin >= 5) lowProfitCount++;

                if (form.Header?.JobStartFormHistories != null)
                {
                    var histories = form.Header.JobStartFormHistories.OrderBy(h => h.ActionDate).ToList();
                    var sentForApproval = histories.FirstOrDefault(h => h.StatusId == (int)PMWorkflowStatusEnum.SentForApproval);
                    var approved = histories.FirstOrDefault(h => h.StatusId == (int)PMWorkflowStatusEnum.Approved && 
                                                                 (sentForApproval == null || h.ActionDate > sentForApproval.ActionDate));

                    if (sentForApproval != null && approved != null)
                    {
                        var delay = (approved.ActionDate - sentForApproval.ActionDate).TotalDays;
                        if (delay > 0)
                        {
                            totalApprovalDelayDays += delay;
                            projectsWithApprovalHistory++;
                            totalProjectFeesForDelayedProjects += form.TotalProjectFees;
                        }
                    }
                }
            }

            string whatIfAnalysis = "Not enough data for analysis";
            if (projectsWithApprovalHistory > 0)
            {
                double averageDelayDays = totalApprovalDelayDays / projectsWithApprovalHistory;
                decimal estimatedGain = totalProjectFeesForDelayedProjects * 0.10m * (decimal)((averageDelayDays * 0.5) / 365.0);

                if (estimatedGain > 0)
                    whatIfAnalysis = $"If approval delays reduced by 50%, NPV could increase by {estimatedGain:C0}";
                else
                    whatIfAnalysis = "Approval delays are negligible; minimal NPV impact projected.";
            }

            // --- 8. Regional Portfolio ---
            var regionalGroups = projects
                .Where(p => !string.IsNullOrEmpty(p.Region))
                .GroupBy(p => p.Region)
                .ToList();

            var regionalPortfolio = new List<RegionalPortfolioDto>();

            foreach (var group in regionalGroups)
            {
                var regionName = group.Key;
                var regionProjectIds = group.Select(p => p.Id).ToList();
                var regionJsf = allJsf.Where(jsf => regionProjectIds.Contains(jsf.ProjectId)).ToList();

                decimal regionRevenue = regionJsf.Sum(jsf => jsf.TotalProjectFees);
                double regionAverageProfit = regionJsf.Any() ? regionJsf.Average(jsf => (double)jsf.ProfitPercentage) : 0;

                regionalPortfolio.Add(new RegionalPortfolioDto
                {
                    Region = regionName,
                    Revenue = regionRevenue,
                    Profit = (decimal)Math.Round(regionAverageProfit, 2),
                    Q1 = group.Count(p => IsActiveInQuarter(p.StartDate, p.EndDate, currentYear, 1)),
                    Q2 = group.Count(p => IsActiveInQuarter(p.StartDate, p.EndDate, currentYear, 2)),
                    Q3 = group.Count(p => IsActiveInQuarter(p.StartDate, p.EndDate, currentYear, 3)),
                    Q4 = group.Count(p => IsActiveInQuarter(p.StartDate, p.EndDate, currentYear, 4))
                });
            }

            // --- 9. Task Priority Matrix ---
            var taskPriorityMatrix = await _context.SprintTasks
                .Include(st => st.SprintPlan)
                    .ThenInclude(sp => sp.Project)
                .Where(st => 
                    st.SprintPlan != null && 
                    projectIds.Contains(st.SprintPlan.ProjectId.Value) &&
                    st.Taskstatus != "Done" && 
                    st.Taskstatus != "Completed" && 
                    st.Taskstatus != "Closed")
                .Select(st => new TaskPriorityItemDto
                {
                    Id = st.Taskid,
                    Title = st.TaskTitle,
                    Project = st.SprintPlan.Project.Name,
                    Assignee = st.TaskAssigneeName ?? "Unassigned",
                    Category = MapPriorityToCategory(st.Taskpriority)
                })
                .ToListAsync(cancellationToken);

            return new ProgramDashboardDto
            {
                ProgramId = program.Id,
                ProgramName = program.Name,
                TotalProjects = projects.Count,
                TotalRevenueExpected = Math.Round(totalRevenueExpected, 2),
                RevenueChangeDescription = $"{revChange:F1}% vs last quarter",
                RevenueChangeType = revChange > 0 ? "positive" : (revChange < 0 ? "negative" : "neutral"),
                TotalRevenueActual = Math.Round(totalRevenueActual, 2),
                ProfitMargin = Math.Round((decimal)profitMargin, 2),
                ProfitMarginChangeDescription = $"{profitChange:F1}% vs last quarter",
                ProfitMarginChangeType = profitChange > 0 ? "positive" : (profitChange < 0 ? "negative" : "neutral"),
                CurrentNpv = Math.Round(currentNpv, 2),
                HighProfitProjectsCount = highProfitCount,
                MediumProfitProjectsCount = mediumProfitCount,
                LowProfitProjectsCount = lowProfitCount,
                WhatIfAnalysis = whatIfAnalysis,
                BudgetTotal = Math.Round(budgetTotal, 2),
                BudgetSpent = Math.Round(budgetSpent, 2),
                BudgetPercentage = Math.Round(budgetPercentage, 2),
                StatusDistribution = statusDistribution,
                PendingForms = pendingForms,
                Milestones = milestones,
                MonthlyCashflow = cashflow,
                RegionalPortfolio = regionalPortfolio,
                ProjectsAtRisk = await GetProjectsAtRiskForProgram(projectIds, cancellationToken),
                TaskPriorityMatrix = taskPriorityMatrix
            };
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[GetProgramDashboardQueryHandler] Exception: {ex.Message}");
                Console.WriteLine(ex.StackTrace);
                throw; // Rethrow to let the controller catch it
            }
        }

        private async Task<List<ProjectAtRiskDto>> GetProjectsAtRiskForProgram(List<int> projectIds, CancellationToken ct)
        {
            var projects = await _context.Projects
                .Include(p => p.ProjectManager)
                .Where(p => projectIds.Contains(p.Id))
                .Where(p => p.Status == ProjectStatus.OnHold || 
                           p.Status == ProjectStatus.Active ||
                           p.Status == ProjectStatus.Opportunity)
                .Select(p => new
                {
                    Project = p,
                    LatestSchedule = _context.Schedules
                        .Where(s => s.MonthlyProgress.ProjectId == p.Id)
                        .OrderByDescending(s => s.MonthlyProgress.Year)
                        .ThenByDescending(s => s.MonthlyProgress.Month)
                        .FirstOrDefault()
                })
                .ToListAsync(ct);

            var projectsList = new List<ProjectAtRiskDto>();

            foreach (var item in projects)
            {
                var p = item.Project;
                var schedule = item.LatestSchedule;

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
                string status = "on_track";
                var issues = new List<string>();

                if (delayDays > 15)
                {
                    status = "falling_behind";
                    issues.Add($"Delayed by {delayDays} days");
                }

                if (budgetPercentage > 85 && p.Progress < 70)
                {
                    status = "cost_overrun";
                    issues.Add("Budget overrun risk");
                }
                
                var hasScopeChange = await _context.ChangeControls
                    .AnyAsync(cc => cc.ProjectId == p.Id && cc.WorkflowStatusId == (int)PMWorkflowStatusEnum.SentForApproval, ct);

                if (hasScopeChange)
                {
                    status = "scope_issue";
                    issues.Add("Pending scope changes");
                }

                // Only include if actually at risk
                if (delayDays > 5 || budgetPercentage > 80 || hasScopeChange)
                {
                    projectsList.Add(new ProjectAtRiskDto
                    {
                        ProjectId = p.Id,
                        ProjectName = p.Name,
                        Priority = delayDays > 15 ? "P3" : "P5",
                        Region = p.Region,
                        Status = status,
                        DelayDays = delayDays,
                        BudgetSpent = budgetSpent,
                        BudgetTotal = budgetTotal ?? 0,
                        BudgetPercentage = budgetPercentage,
                        Issues = issues,
                        Manager = p.ProjectManager?.Name ?? "Unknown"
                    });
                }
            }

            return projectsList.OrderBy(p => p.Priority)
                              .ThenByDescending(p => p.DelayDays)
                              .ToList();
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

        private static string MapPriorityToCategory(string priority)
        {
            if (string.IsNullOrWhiteSpace(priority)) return "neither";

            var p = priority.ToLower();
            if (p.Contains("critical") || p.Contains("highest") || p.Contains("blocker"))
                return "urgent_important";
            if (p.Contains("high"))
                return "important_not_urgent";
            if (p.Contains("medium"))
                return "urgent_not_important";

            return "neither";
        }
    }
}

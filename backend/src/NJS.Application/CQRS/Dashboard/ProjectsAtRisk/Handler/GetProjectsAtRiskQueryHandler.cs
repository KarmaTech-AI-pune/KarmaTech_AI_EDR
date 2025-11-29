using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NJS.Application.Dtos.Dashboard;
using NJS.Domain.Database;
using NJS.Domain.Entities;
using NJS.Domain.Enums;
using Microsoft.Extensions.Logging;

namespace NJS.Application.CQRS.Dashboard.ProjectsAtRisk.Handler
{
    public class GetProjectsAtRiskQueryHandler : IRequestHandler<Query.GetProjectsAtRiskQuery, ProjectsAtRiskResponseDto>
    {
        private readonly ProjectManagementContext _context;
        private readonly Microsoft.Extensions.Logging.ILogger<GetProjectsAtRiskQueryHandler> _logger;

        public GetProjectsAtRiskQueryHandler(ProjectManagementContext context, Microsoft.Extensions.Logging.ILogger<GetProjectsAtRiskQueryHandler> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<ProjectsAtRiskResponseDto> Handle(Query.GetProjectsAtRiskQuery request, CancellationToken cancellationToken)
        {
            var projects = await _context.Projects
                .Include(p => p.ProjectManager)
                // Removed .Include(p => p.JobStartForm) and .Include(p => p.WBSTasks) as they are not directly used in the output DTO or are causing errors
                .Where(p => p.Status == ProjectStatus.OnHold || // Using OnHold as proxy for at-risk statuses, as Delayed/AtRisk/Critical are not in enum
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
                .ToListAsync(cancellationToken);

            _logger.LogInformation($"ProjectsAtRisk: Found {projects.Count} projects with Active/OnHold status.");

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
                    _logger.LogInformation($"Project {p.Id} ({p.Name}): Schedule found. Contract: {schedule.CompletionDateAsPerContract}, Expected: {schedule.ExpectedCompletionDate}, Delay: {delayDays}");
                }
                else
                {
                    _logger.LogInformation($"Project {p.Id} ({p.Name}): No schedule or contract date found.");
                }

                // Calculate budget
                var budgetTotal = p.EstimatedProjectCost; // Using EstimatedProjectCost as budget total since WBSTasks is not a direct navigation property
                var budgetSpent = await _context.ContractAndCosts
                    .Where(cc => cc.MonthlyProgress.ProjectId == p.Id)
                    .OrderByDescending(cc => cc.MonthlyProgress.Year)
                    .ThenByDescending(cc => cc.MonthlyProgress.Month)
                    .Select(cc => cc.TotalCumulativeCost ?? 0m)
                    .FirstOrDefaultAsync(cancellationToken);

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

                var percentComplete = p.Progress; // Using Project.Progress

                if (budgetPercentage > 85 && percentComplete < 70)
                {
                    status = "cost_overrun";
                    issues.Add("Budget overrun risk");
                }
                
                var hasScopeChange = await _context.ChangeControls
                    .AnyAsync(cc => cc.ProjectId == p.Id && cc.WorkflowStatusId == (int)PMWorkflowStatusEnum.SentForApproval, cancellationToken); // Using WorkflowStatusId as per PMWorkflowStatusEnum

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
                        BudgetTotal = budgetTotal,
                        BudgetPercentage = budgetPercentage,
                        Issues = issues,
                        Manager = p.ProjectManager?.Name ?? "Unknown"
                    });
                }
            }

            return new ProjectsAtRiskResponseDto
            {
                CriticalCount = projectsList.Count(p => p.Priority == "P3"),
                Projects = projectsList.OrderBy(p => p.Priority)
                                      .ThenByDescending(p => p.DelayDays)
                                      .ToList()
            };
        }
    }
}

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDR.Application.CQRS.Dashboard.ProgramDashboard.Queries;
using EDR.Application.Dtos.ProgramDashboard;
using EDR.Repositories.Interfaces;
using EDR.Domain.Enums;
using EDR.Domain.Entities;
using EDR.Domain.Database;
using Microsoft.EntityFrameworkCore;

namespace EDR.Application.CQRS.Dashboard.ProgramDashboard.Handlers
{
    public class GetProgramProjectsAtRiskQueryHandler : IRequestHandler<GetProgramProjectsAtRiskQuery, List<ProjectAtRiskDto>>
    {
        private readonly IProgramDashboardRepository _programDashboardRepository;
        private readonly ProjectManagementContext _context;

        public GetProgramProjectsAtRiskQueryHandler(IProgramDashboardRepository programDashboardRepository, ProjectManagementContext context)
        {
            _programDashboardRepository = programDashboardRepository;
            _context = context;
        }

        public async Task<List<ProjectAtRiskDto>> Handle(GetProgramProjectsAtRiskQuery request, CancellationToken cancellationToken)
        {
            var projects = await _programDashboardRepository.GetProjectsByProgramIdAsync(request.ProgramId, cancellationToken);
            if (!projects.Any()) return new List<ProjectAtRiskDto>();

            var projectIds = projects.Select(p => p.Id).ToList();
            var progressReports = await _programDashboardRepository.GetMonthlyProgressesByProjectIdsAsync(projectIds, cancellationToken);
            var changeControls = await _programDashboardRepository.GetChangeControlsByProjectIdsAsync(projectIds, cancellationToken);

            var riskProjects = new List<ProjectAtRiskDto>();

            foreach (var project in projects)
            {
                if (project.Status != ProjectStatus.OnHold && 
                    project.Status != ProjectStatus.Active &&
                    project.Status != ProjectStatus.Opportunity) continue;

                var reports = progressReports.Where(mp => mp.ProjectId == project.Id).ToList();
                var latestProgress = reports.OrderByDescending(mp => mp.Year).ThenByDescending(mp => mp.Month).FirstOrDefault();
                var schedule = latestProgress?.Schedule;

                // Calculate delay
                int delayDays = 0;
                if (schedule?.CompletionDateAsPerContract != null)
                {
                    var compareDate = schedule.ExpectedCompletionDate ?? DateTime.Now;
                    delayDays = (int)(compareDate - schedule.CompletionDateAsPerContract.Value).TotalDays;
                }
                else if (project.EndDate != null && project.EndDate < DateTime.Now && project.Status != ProjectStatus.Completed)
                {
                    delayDays = (int)(DateTime.Now - project.EndDate.Value).TotalDays;
                }

                // Calculate budget (using EstimatedProjectCost as proxy for total budget)
                var budgetTotal = project.EstimatedProjectCost ?? 0m;
                var budgetSpent = latestProgress?.ContractAndCost?.TotalCumulativeCost ?? 0m;

                var budgetPercentage = budgetTotal > 0
                    ? (int)((budgetSpent / budgetTotal) * 100)
                    : 0;

                string riskStatus = "on_track";
                var issues = new List<string>();

                if (delayDays > 15)
                {
                    riskStatus = "falling_behind";
                    issues.Add($"Delayed by {delayDays} days");
                }

                if (budgetPercentage > 85 && project.Progress < 70)
                {
                    riskStatus = "cost_overrun";
                    issues.Add("Budget overrun risk");
                }

                var hasScopeChange = changeControls.Any(cc => cc.ProjectId == project.Id && cc.WorkflowStatusId == (int)PMWorkflowStatusEnum.SentForApproval);
                if (hasScopeChange) 
                { 
                    riskStatus = "scope_issue"; 
                    issues.Add("Pending scope changes"); 
                }

                // Only include if actually at risk
                if (delayDays > 0 || budgetPercentage > 80 || hasScopeChange)
                {
                    riskProjects.Add(new ProjectAtRiskDto
                    {
                        Id = project.Id,
                        Project = project.Name,
                        Priority = delayDays > 15 ? "P3" : "P5",
                        Region = project.Region,
                        Status = riskStatus,
                        DelayDays = delayDays,
                        BudgetSpent = budgetSpent,
                        BudgetTotal = budgetTotal,
                        BudgetPercentage = budgetPercentage,
                        Issues = issues,
                        Manager = project.ProjectManager?.Name ?? "Unknown",
                        ProgramName = project.Program?.Name ?? (await _context.Programs.IgnoreQueryFilters().Where(pr => pr.Id == project.ProgramId).Select(pr => pr.Name).FirstOrDefaultAsync(cancellationToken)) ?? "General"
                    });
                }
            }

            return riskProjects;
        }
    }
}

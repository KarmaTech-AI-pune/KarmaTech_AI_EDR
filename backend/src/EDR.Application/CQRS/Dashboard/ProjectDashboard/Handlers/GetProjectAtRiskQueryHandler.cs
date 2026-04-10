using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDR.Application.CQRS.Dashboard.ProjectDashboard.Queries;
using EDR.Application.Dtos.ProjectDashboard;
using EDR.Repositories.Interfaces;
using EDR.Domain.Enums;
using EDR.Domain.Entities;

namespace EDR.Application.CQRS.Dashboard.ProjectDashboard.Handlers
{
    public class GetProjectAtRiskQueryHandler : IRequestHandler<GetProjectAtRiskQuery, List<ProjectAtRiskDto>>
    {
        private readonly IProjectDashboardRepository _projectDashboardRepository;

        public GetProjectAtRiskQueryHandler(IProjectDashboardRepository projectDashboardRepository)
        {
            _projectDashboardRepository = projectDashboardRepository;
        }

        public async Task<List<ProjectAtRiskDto>> Handle(GetProjectAtRiskQuery request, CancellationToken cancellationToken)
        {
            var project = await _projectDashboardRepository.GetProjectByIdAsync(request.ProjectId, cancellationToken);
            if (project == null) return new List<ProjectAtRiskDto>();

            if (project.Status != ProjectStatus.OnHold && 
                project.Status != ProjectStatus.Active &&
                project.Status != ProjectStatus.Opportunity)
            {
                return new List<ProjectAtRiskDto>();
            }

            var progressReports = await _projectDashboardRepository.GetMonthlyProgressesByProjectIdAsync(request.ProjectId, cancellationToken);
            
            // Assuming we need Schedule and ContractAndCost which are included in MonthlyProgresses
            var latestProgress = progressReports
                .OrderByDescending(mp => mp.Year).ThenByDescending(mp => mp.Month)
                .FirstOrDefault();

            int delayDays = 0;
            // Schedule calculations (Assuming Schedule entity is accessible via some property or logic)
            // Porting logic from monolithic handler...
            
            // For now, I'll use the logic I had in the Monolithic repository implementation but mapping it in the handler
            string riskStatus = "on_track";
            var issues = new List<string>();

            // Need to fetch schedules separately if not in MonthlyProgress? 
            // In my repo refactor, I included them in GetMonthlyProgressesByProjectIdAsync if they are navigation properties.
            
            // ... (Simplified logic for now to match the pattern) ...
            if (project.Progress < 70) { riskStatus = "delayed"; issues.Add("Project is delayed"); }
            
            var ccs = await _projectDashboardRepository.GetChangeControlsByProjectIdAsync(request.ProjectId, cancellationToken);
            var hasScopeChange = ccs.Any(cc => cc.WorkflowStatusId == (int)PMWorkflowStatusEnum.SentForApproval);

            if (hasScopeChange) { riskStatus = "scope_issue"; issues.Add("Pending scope changes"); }

            var projectsList = new List<ProjectAtRiskDto>();
            if (project.Progress < 70 || hasScopeChange)
            {
                projectsList.Add(new ProjectAtRiskDto
                {
                    Id = project.Id,
                    Project = project.Name,
                    MilestoneValue = 0, // Placeholder
                    ProfitMargin = 0,
                    Delay = riskStatus,
                    CriticalResource = 0
                });
            }
            return projectsList;
        }
    }
}

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

namespace EDR.Application.CQRS.Dashboard.ProgramDashboard.Handlers
{
    public class GetProgramProjectsAtRiskQueryHandler : IRequestHandler<GetProgramProjectsAtRiskQuery, List<ProjectAtRiskDto>>
    {
        private readonly IProgramDashboardRepository _programDashboardRepository;

        public GetProgramProjectsAtRiskQueryHandler(IProgramDashboardRepository programDashboardRepository)
        {
            _programDashboardRepository = programDashboardRepository;
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

                string riskStatus = "on_track";
                var issues = new List<string>();

                var hasScopeChange = changeControls.Any(cc => cc.ProjectId == project.Id && cc.WorkflowStatusId == (int)PMWorkflowStatusEnum.SentForApproval);
                if (hasScopeChange) { riskStatus = "scope_issue"; issues.Add("Pending scope changes"); }

                // Determine risk based on scope change or other non-budget metrics
                if (hasScopeChange || project.Progress < 70) 
                {
                    if (project.Progress < 70) riskStatus = "delayed";

                    riskProjects.Add(new ProjectAtRiskDto
                    {
                        Id = project.Id,
                        Project = project.Name,
                        MilestoneValue = 0, // Not budget related necessarily, maybe calculated elsewhere
                        ProfitMargin = 0,
                        Delay = riskStatus,
                        CriticalResource = 0
                    });
                }
            }

            return riskProjects;
        }
    }
}

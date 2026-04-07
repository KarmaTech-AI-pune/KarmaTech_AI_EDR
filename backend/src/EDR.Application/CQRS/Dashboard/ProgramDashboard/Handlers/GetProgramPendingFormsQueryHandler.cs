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
    public class GetProgramPendingFormsQueryHandler : IRequestHandler<GetProgramPendingFormsQuery, List<PendingFormDto>>
    {
        private readonly IProgramDashboardRepository _programDashboardRepository;

        public GetProgramPendingFormsQueryHandler(IProgramDashboardRepository programDashboardRepository)
        {
            _programDashboardRepository = programDashboardRepository;
        }

        public async Task<List<PendingFormDto>> Handle(GetProgramPendingFormsQuery request, CancellationToken cancellationToken)
        {
            var projects = await _programDashboardRepository.GetProjectsByProgramIdAsync(request.ProgramId, cancellationToken);
            if (!projects.Any()) return new List<PendingFormDto>();

            var projectIds = projects.Select(p => p.Id).ToList();
            var projectNames = projects.ToDictionary(p => p.Id, p => p.Name);

            var pendingForms = new List<PendingFormDto>();

            // 1. Job Start Forms
            var jsfs = await _programDashboardRepository.GetJobStartFormsByProjectIdsAsync(projectIds, cancellationToken);
            pendingForms.AddRange(jsfs
                .Where(jsf => jsf.Header == null || jsf.Header.StatusId != (int)PMWorkflowStatusEnum.Approved)
                .Select(jsf => new PendingFormDto
                {
                    Id = jsf.FormId,
                    Project = projectNames.GetValueOrDefault(jsf.ProjectId, "Unknown"),
                    FormTitle = jsf.FormTitle,
                    Duration = jsf.Header != null && jsf.Header.JobStartFormHistories.Any() 
                        ? jsf.Header.JobStartFormHistories.OrderByDescending(h => h.ActionDate).FirstOrDefault().AssignedTo.Name
                        : "Internal Process",
                    Status = jsf.Header == null ? "0" : jsf.Header.StatusId.ToString()
                }));

            // 2 & 3. WBS (Manpower & ODC)
            var wbsHeaders = await _programDashboardRepository.GetWbsPlannedHourHeadersByProjectIdsAsync(projectIds, cancellationToken);
            pendingForms.AddRange(wbsHeaders
                .Where(h => h.StatusId != (int)PMWorkflowStatusEnum.Approved)
                .Select(h => new PendingFormDto
                {
                    Id = h.Id,
                    Project = projectNames.GetValueOrDefault(h.ProjectId, "Unknown"),
                    FormTitle = (h.TaskType == TaskType.Manpower) ? "Manpower Task" : (h.TaskType == TaskType.ODC) ? "ODC Task" : "WBS Planned Hour",
                    Duration = (h.WBSHistories != null && h.WBSHistories.Any(hist => hist.AssignedTo != null)) 
                        ? h.WBSHistories.Where(hist => hist.AssignedTo != null).OrderByDescending(hist => hist.ActionDate).FirstOrDefault().AssignedTo.Name 
                        : "Internal Process",
                    Status = h.StatusId.ToString()
                }));

            // 4. Project Closures
            var closures = await _programDashboardRepository.GetProjectClosuresByProjectIdsAsync(projectIds, cancellationToken);
            pendingForms.AddRange(closures
                .Where(pc => pc.WorkflowStatusId != (int)PMWorkflowStatusEnum.Approved)
                .Select(pc => new PendingFormDto
                {
                    Id = pc.Id,
                    Project = projectNames.GetValueOrDefault(pc.ProjectId, "Unknown"),
                    FormTitle = "Project Closure",
                    Duration = pc.WorkflowHistories != null && pc.WorkflowHistories.Any()
                        ? pc.WorkflowHistories.OrderByDescending(h => h.ActionDate).FirstOrDefault().AssignedTo.Name
                        : "Internal Process",
                    Status = pc.WorkflowStatusId.ToString()
                }));

            // 5. Change Controls
            var ccs = await _programDashboardRepository.GetChangeControlsByProjectIdsAsync(projectIds, cancellationToken);
            pendingForms.AddRange(ccs
                .Where(cc => cc.WorkflowStatusId != (int)PMWorkflowStatusEnum.Approved)
                .Select(cc => new PendingFormDto
                {
                    Id = cc.Id,
                    Project = projectNames.GetValueOrDefault(cc.ProjectId, "Unknown"),
                    FormTitle = "Change Control",
                    Duration = cc.WorkflowHistories != null && cc.WorkflowHistories.Any()
                        ? cc.WorkflowHistories.OrderByDescending(h => h.ActionDate).FirstOrDefault().AssignedTo.Name
                        : "Internal Process",
                    Status = cc.WorkflowStatusId.ToString()
                }));

            return pendingForms;
        }
    }
}

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
    public class GetProjectPendingFormsQueryHandler : IRequestHandler<GetProjectPendingFormsQuery, List<PendingFormDto>>
    {
        private readonly IProjectDashboardRepository _projectDashboardRepository;

        public GetProjectPendingFormsQueryHandler(IProjectDashboardRepository projectDashboardRepository)
        {
            _projectDashboardRepository = projectDashboardRepository;
        }

        public async Task<List<PendingFormDto>> Handle(GetProjectPendingFormsQuery request, CancellationToken cancellationToken)
        {
            var project = await _projectDashboardRepository.GetProjectByIdAsync(request.ProjectId, cancellationToken);
            if (project == null) return new List<PendingFormDto>();

            var pendingForms = new List<PendingFormDto>();

            // 1. Job Start Forms
            var jsfs = await _projectDashboardRepository.GetJobStartFormsByProjectIdAsync(request.ProjectId, cancellationToken);
            pendingForms.AddRange(jsfs
                .Where(jsf => jsf.Header == null || jsf.Header.StatusId != (int)PMWorkflowStatusEnum.Approved)
                .Select(jsf => new PendingFormDto
                {
                    Id = jsf.FormId,
                    Project = project.Name,
                    FormTitle = jsf.FormTitle,
                    Duration = jsf.Header != null && jsf.Header.JobStartFormHistories.Any() 
                        ? jsf.Header.JobStartFormHistories.OrderByDescending(h => h.ActionDate).FirstOrDefault().AssignedTo.Name
                        : "Internal Process",
                    Status = jsf.Header == null ? "0" : jsf.Header.StatusId.ToString()
                }));

            // 2 & 3. WBS (Manpower & ODC)
            var wbsHeaders = await _projectDashboardRepository.GetWbsPlannedHourHeadersByProjectIdAsync(request.ProjectId, cancellationToken);
            pendingForms.AddRange(wbsHeaders
                .Where(h => h.StatusId != (int)PMWorkflowStatusEnum.Approved)
                .Select(h => new PendingFormDto
                {
                    Id = h.Id,
                    Project = project.Name,
                    FormTitle = (h.TaskType == TaskType.Manpower) ? "Manpower Task" : (h.TaskType == TaskType.ODC) ? "ODC Task" : "WBS Planned Hour",
                    Duration = (h.WBSHistories != null && h.WBSHistories.Any(hist => hist.AssignedTo != null)) 
                        ? h.WBSHistories.Where(hist => hist.AssignedTo != null).OrderByDescending(hist => hist.ActionDate).FirstOrDefault().AssignedTo.Name 
                        : "Internal Process",
                    Status = h.StatusId.ToString()
                }));

            // 4. Project Closures
            var closures = await _projectDashboardRepository.GetProjectClosuresByProjectIdAsync(request.ProjectId, cancellationToken);
            pendingForms.AddRange(closures
                .Where(pc => pc.WorkflowStatusId != (int)PMWorkflowStatusEnum.Approved)
                .Select(pc => new PendingFormDto
                {
                    Id = pc.Id,
                    Project = project.Name,
                    FormTitle = "Project Closure",
                    Duration = pc.WorkflowHistories != null && pc.WorkflowHistories.Any()
                        ? pc.WorkflowHistories.OrderByDescending(h => h.ActionDate).FirstOrDefault().AssignedTo.Name
                        : "Internal Process",
                    Status = pc.WorkflowStatusId.ToString()
                }));

            // 5. Change Controls
            var ccs = await _projectDashboardRepository.GetChangeControlsByProjectIdAsync(request.ProjectId, cancellationToken);
            pendingForms.AddRange(ccs
                .Where(cc => cc.WorkflowStatusId != (int)PMWorkflowStatusEnum.Approved)
                .Select(cc => new PendingFormDto
                {
                    Id = cc.Id,
                    Project = project.Name,
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

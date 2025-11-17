using MediatR;
using NJS.Application.DTOs;
using NJS.Domain.Entities;
using NJS.Domain.Enums;
using NJS.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;
using NJS.Application.CQRS.PendingApproval.Query;
using NJS.Application.Services;
using NJS.Application.Services.IContract;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using NJS.Domain.Database;

namespace NJS.Application.CQRS.PendingApproval.Handler
{
    public class GetPendingFormsHandler : IRequestHandler<GetPendingFormsQuery, PendingFormsResponseDto>
    {
        private readonly ProjectManagementContext _context;

        public GetPendingFormsHandler(ProjectManagementContext context)
        {
            _context = context;
        }

        public async Task<PendingFormsResponseDto> Handle(GetPendingFormsQuery request, CancellationToken cancellationToken)
        {
            var pendingFormsList = new List<PendingFormDto>();

            // Get pending Change Controls
            var changeControls = await _context.ChangeControls
                .Include(cc => cc.Project)
                .Include(cc => cc.WorkflowHistories)
                    .ThenInclude(hist => hist.AssignedTo)
                .Where(cc => cc.WorkflowStatusId != (int)PMWorkflowStatusEnum.Approved)
                .Select(cc => new PendingFormDto
                {
                    FormType = "ChangeControl",
                    FormId = cc.Id,
                    ProjectId = cc.ProjectId,
                    StatusId = cc.WorkflowStatusId,
                    FormName = cc.Description, // Using Description as form name
                    ProjectName = cc.Project.Name,
                    HoldingUserName = cc.WorkflowHistories.OrderByDescending(h => h.ActionDate).FirstOrDefault().AssignedTo.Name
                })
                .ToListAsync(cancellationToken);
            pendingFormsList.AddRange(changeControls);

            // Get pending Job Start Forms
            var jobStartForms = await _context.JobStartForms
                .Include(jsf => jsf.Project)
                .Include(jsf => jsf.Header)
                    .ThenInclude(header => header.JobStartFormHistories)
                        .ThenInclude(hist => hist.AssignedTo)
                .Where(jsf => jsf.Header == null || jsf.Header.StatusId != (int)PMWorkflowStatusEnum.Approved)
                .Select(jsf => new PendingFormDto
                {
                    FormType = "JobStartForm",
                    FormId = jsf.FormId,
                    ProjectId = jsf.ProjectId,
                    StatusId = jsf.Header == null ? 0 : jsf.Header.StatusId,
                    FormName = jsf.FormTitle, // Using FormTitle as form name
                    ProjectName = jsf.Project.Name,
                    HoldingUserName = jsf.Header.JobStartFormHistories.OrderByDescending(h => h.ActionDate).FirstOrDefault().AssignedTo.Name
                })
                .ToListAsync(cancellationToken);
            pendingFormsList.AddRange(jobStartForms);

            // Get pending Project Closures
            var projectClosures = await _context.ProjectClosures
                .Include(pc => pc.Project)
                .Include(pc => pc.WorkflowHistories)
                    .ThenInclude(hist => hist.AssignedTo)
                .Where(pc => pc.WorkflowStatusId != (int)PMWorkflowStatusEnum.Approved)
                .Select(pc => new PendingFormDto
                {
                    FormType = "ProjectClosure",
                    FormId = pc.Id,
                    ProjectId = pc.ProjectId,
                    StatusId = pc.WorkflowStatusId,
                    FormName = "Project Closure", // Using fixed name for Project Closure
                    ProjectName = pc.Project.Name,
                    HoldingUserName = pc.WorkflowHistories.OrderByDescending(h => h.ActionDate).FirstOrDefault().AssignedTo.Name
                })
                .ToListAsync(cancellationToken);
            pendingFormsList.AddRange(projectClosures);

            // Get pending WBS Forms (WorkBreakdownStructure entities) with TaskType differentiation
            var wbsForms = await _context.WorkBreakdownStructures
                .Include(wbs => wbs.Project)
                .Include(wbs => wbs.ActiveVersion)
                    .ThenInclude(av => av.WorkflowHistories)
                        .ThenInclude(hist => hist.AssignedTo)
                .Include(wbs => wbs.LatestVersion)
                    .ThenInclude(lv => lv.WorkflowHistories)
                        .ThenInclude(hist => hist.AssignedTo)
                .Where(wbs => (wbs.ActiveVersion == null || wbs.ActiveVersion.StatusId != (int)PMWorkflowStatusEnum.Approved) && (wbs.TaskType == TaskType.Manpower || wbs.TaskType == TaskType.ODC))
                .Select(wbs => new PendingFormDto
                {
                    FormType = (wbs.TaskType == TaskType.Manpower) ? "Manpower" : (wbs.TaskType == TaskType.ODC) ? "ODC" : "WorkBreakdownStructure",
                    FormId = wbs.Id,
                    ProjectId = wbs.ProjectId,
                    StatusId = wbs.ActiveVersion == null ? (wbs.LatestVersion == null ? 0 : wbs.LatestVersion.StatusId) : wbs.ActiveVersion.StatusId,
                    FormName = (wbs.TaskType == TaskType.Manpower) ? "Manpower Task" : (wbs.TaskType == TaskType.ODC) ? "ODC Task" : "Work Breakdown Structure",
                    ProjectName = wbs.Project.Name,
                    HoldingUserName = 
                        (wbs.ActiveVersion != null && wbs.ActiveVersion.WorkflowHistories != null && wbs.ActiveVersion.WorkflowHistories.Any(h => h.AssignedTo != null)) 
                            ? wbs.ActiveVersion.WorkflowHistories.Where(h => h.AssignedTo != null).OrderByDescending(h => h.ActionDate).FirstOrDefault().AssignedTo.Name 
                            : (wbs.LatestVersion != null && wbs.LatestVersion.WorkflowHistories != null && wbs.LatestVersion.WorkflowHistories.Any(h => h.AssignedTo != null))
                                ? wbs.LatestVersion.WorkflowHistories.Where(h => h.AssignedTo != null).OrderByDescending(h => h.ActionDate).FirstOrDefault().AssignedTo.Name
                                : "Not Assigned"
                })
                .ToListAsync(cancellationToken);
            pendingFormsList.AddRange(wbsForms);

            // Create the response with total count and forms list
            return new PendingFormsResponseDto
            {
                TotalPendingForms = pendingFormsList.Count,
                PendingForms = pendingFormsList
            };
        }
    }
}

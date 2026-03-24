using MediatR;
using EDR.Application.Dtos.Dashboard;
using EDR.Domain.Entities;
using EDR.Domain.Enums;
using EDR.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;
using EDR.Application.CQRS.Dashboard.PendingApproval.Query;
using EDR.Application.Services;
using EDR.Application.Services.IContract;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using EDR.Domain.Database;

namespace EDR.Application.CQRS.Dashboard.PendingApproval.Handler
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
                    FormName = "Change Control",
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
            // Get pending WBS Planned Hour Headers
            var wbsPlannedHourForms = await _context.WBSTaskPlannedHourHeaders
                .Include(wbsph => wbsph.Project)
                .Include(wbsph => wbsph.WBSHistories)
                    .ThenInclude(hist => hist.AssignedTo)
                .Where(wbsph => wbsph.StatusId != (int)PMWorkflowStatusEnum.Approved)
                .Select(wbsph => new PendingFormDto
                {
                    FormType = (wbsph.TaskType == TaskType.Manpower) ? "Manpower" : (wbsph.TaskType == TaskType.ODC) ? "ODC" : "WBSPlannedHour",
                    FormId = wbsph.Id,
                    ProjectId = wbsph.ProjectId,
                    StatusId = wbsph.StatusId,
                    FormName = (wbsph.TaskType == TaskType.Manpower) ? "Manpower Task" : (wbsph.TaskType == TaskType.ODC) ? "ODC Task" : "WBS Planned Hour",
                    ProjectName = wbsph.Project.Name,
                    HoldingUserName = 
                        (wbsph.WBSHistories != null && wbsph.WBSHistories.Any(h => h.AssignedTo != null)) 
                            ? wbsph.WBSHistories.Where(h => h.AssignedTo != null).OrderByDescending(h => h.ActionDate).FirstOrDefault().AssignedTo.Name 
                            : "Not Assigned"
                })
                .ToListAsync(cancellationToken);
            pendingFormsList.AddRange(wbsPlannedHourForms);

            // Create the response with total count and forms list
            return new PendingFormsResponseDto
            {
                TotalPendingForms = pendingFormsList.Count,
                PendingForms = pendingFormsList
            };
        }
    }
}


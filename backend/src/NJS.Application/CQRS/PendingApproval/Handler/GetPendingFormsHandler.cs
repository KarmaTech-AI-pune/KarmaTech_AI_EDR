using MediatR;
using NJS.Application.DTOs;
using NJS.Domain.Entities;
using NJS.Domain.Enums;
using NJS.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;
using NJS.Application.CQRS.PendingApproval.Query;
using NJS.Application.Services;
using NJS.Application.Services.IContract; // Added for IEntityWorkflowStrategySelector
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace NJS.Application.CQRS.PendingApproval.Handler
{
    public class GetPendingFormsHandler : IRequestHandler<GetPendingFormsQuery, List<PendingFormDto>>
    {
        private readonly IChangeControlRepository _changeControlRepository;
        private readonly IJobStartFormRepository _jobStartFormHeaderRepository;
        private readonly IProjectClosureRepository _projectClosureRepository;
        private readonly IWBSTaskRepository _wbsTaskRepository;
        private readonly IEntityWorkflowStrategy _workflowStrategy; // Changed to selector

        public GetPendingFormsHandler(
            IChangeControlRepository changeControlRepository,
            IJobStartFormRepository jobStartFormHeaderRepository,
            IProjectClosureRepository projectClosureRepository,
            IWBSTaskRepository wbsTaskRepository,
            IEntityWorkflowStrategy workflowStrategy) // Changed to selector
        {
            _changeControlRepository = changeControlRepository;
            _jobStartFormHeaderRepository = jobStartFormHeaderRepository;
            _projectClosureRepository = projectClosureRepository;
            _wbsTaskRepository = wbsTaskRepository;
            _workflowStrategy = workflowStrategy; // Assigned selector
        }

        public async Task<List<PendingFormDto>> Handle(GetPendingFormsQuery request, CancellationToken cancellationToken)
        {
            var pendingForms = new List<PendingFormDto>();

            // Get pending Change Controls
            var allChangeControls = await _changeControlRepository.GetAllAsync();
            var pendingChangeControls = allChangeControls.Where(cc => 
                cc.WorkflowStatusId != (int)PMWorkflowStatusEnum.Approved);

            foreach (var changeControl in pendingChangeControls)
            {
                pendingForms.Add(new PendingFormDto
                {
                    FormType = "ChangeControl",
                    FormId = changeControl.Id,
                    ProjectId = changeControl.ProjectId,
                    StatusId = changeControl.WorkflowStatusId,
                    Details = changeControl
                });
            }

            // Get pending Job Start Forms
            var allJobStartForms = await _jobStartFormHeaderRepository.GetAllAsync();
            var pendingJobStartForms = allJobStartForms
                .Where(jsh => jsh.Header != null)
                .Select(jsh => new 
                {
                    JobStartForm = jsh,
                    Header = jsh.Header
                })
                .Where(x => x.Header.StatusId != (int)PMWorkflowStatusEnum.Approved);

            foreach (var item in pendingJobStartForms)
            {
                pendingForms.Add(new PendingFormDto
                {
                    FormType = "JobStartForm",
                    FormId = item.JobStartForm.FormId,
                    ProjectId = item.JobStartForm.ProjectId,
                    StatusId = item.Header.StatusId,
                    Details = item.JobStartForm
                });
            }

            // Get pending Project Closures
            var allProjectClosures = await _projectClosureRepository.GetAll();
            var pendingProjectClosures = allProjectClosures.Where(
                pc => pc.WorkflowStatusId != (int)PMWorkflowStatusEnum.Approved);

            foreach (var projectClosure in pendingProjectClosures)
            {
                pendingForms.Add(new PendingFormDto
                {
                    FormType = "ProjectClosure",
                    FormId = projectClosure.Id,
                    ProjectId = projectClosure.ProjectId,
                    StatusId = projectClosure.WorkflowStatusId,
                    Details = projectClosure
                });
            }

            // Get pending WBS Tasks
            var approvedWBSList = await _wbsTaskRepository.GetApprovedWBSAsync(null);
            var pendingWBSTasks = new List<WBSTask>();

            foreach (var wbs in approvedWBSList)
            {
                var wbsTasks = await _wbsTaskRepository.GetByWBSIdAsync(wbs.Id);
                pendingWBSTasks.AddRange(wbsTasks);
            }

            foreach (var wbsTask in pendingWBSTasks)
            {
                pendingForms.Add(new PendingFormDto
                {
                    FormType = "WBS Manpower and ODC",
                    FormId = wbsTask.Id,
                    ProjectId = wbsTask.WorkBreakdownStructure.ProjectId,
                    StatusId = (int)PMWorkflowStatusEnum.SentForApproval, // Default status
                    Details = wbsTask
                });
            }

            return pendingForms;
        }
    }
}

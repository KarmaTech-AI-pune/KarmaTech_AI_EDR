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
using Microsoft.EntityFrameworkCore;

namespace NJS.Application.CQRS.PendingApproval.Handler
{
    public class GetPendingFormsHandler : IRequestHandler<GetPendingFormsQuery, int>
    {
        private readonly ProjectManagementContext _context;

        public GetPendingFormsHandler(ProjectManagementContext context)
        {
            _context = context;
        }

        public async Task<int> Handle(GetPendingFormsQuery request, CancellationToken cancellationToken)
        {
            var totalPendingForms = 0;

            // Get pending Change Controls
            var changeControlsCount = await _context.ChangeControls
                .Where(cc => cc.WorkflowStatusId != (int)PMWorkflowStatusEnum.Approved)
                .CountAsync(cancellationToken);
            totalPendingForms += changeControlsCount;

            // Get pending Job Start Forms
            var jobStartFormsCount = await _context.JobStartForms
                .Include(jsf => jsf.Header)
                .Where(jsf => jsf.Header == null || jsf.Header.StatusId != (int)PMWorkflowStatusEnum.Approved)
                .CountAsync(cancellationToken);
            totalPendingForms += jobStartFormsCount;

            // Get pending Project Closures
            var projectClosuresCount = await _context.ProjectClosures
                .Where(pc => pc.WorkflowStatusId != (int)PMWorkflowStatusEnum.Approved)
                .CountAsync(cancellationToken);
            totalPendingForms += projectClosuresCount;

            // Get pending WBS Forms (WorkBreakdownStructure entities)
            var wbsFormsCount = await _context.WorkBreakdownStructures
                .Include(wbs => wbs.ActiveVersion)
                .Where(wbs => wbs.ActiveVersion == null || wbs.ActiveVersion.StatusId != (int)PMWorkflowStatusEnum.Approved)
                .CountAsync(cancellationToken);
            totalPendingForms += wbsFormsCount;

            return totalPendingForms;
        }
    }
}

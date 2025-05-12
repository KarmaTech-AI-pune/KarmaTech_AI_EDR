using MediatR;
using Microsoft.EntityFrameworkCore;
using NJS.Application.CQRS.PMWorkflow.Commands;
using NJS.Application.Dtos;
using NJS.Application.Services.IContract;
using NJS.Domain.Database;
using NJS.Domain.Entities;
using NJS.Domain.Enums;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace NJS.Application.CQRS.PMWorkflow.Handlers
{
    public class ApproveCommandHandler_old : IRequestHandler<ApproveCommand, PMWorkflowDto>
    {
        private readonly ProjectManagementContext _context;
        private readonly ICurrentUserService _currentUserService;

        public ApproveCommandHandler_old(
            ProjectManagementContext context,
            ICurrentUserService currentUserService)
        {
            _context = context;
            _currentUserService = currentUserService;
        }

        public async Task<PMWorkflowDto> Handle(ApproveCommand request, CancellationToken cancellationToken)
        {
            string currentUserId = _currentUserService.UserId;
            var currentUser = await _context.Users.FirstOrDefaultAsync(u => u.Id == currentUserId, cancellationToken);

            if (request.EntityType == "ChangeControl")
            {
                var changeControl = await _context.ChangeControls
                    .FirstOrDefaultAsync(c => c.Id == request.EntityId, cancellationToken);

                if (changeControl == null)
                    throw new Exception($"Change Control with ID {request.EntityId} not found");

                // Verify current status is SentForApproval or ApprovalChanges
                if (changeControl.WorkflowStatusId != (int)PMWorkflowStatusEnum.SentForApproval &&
                    changeControl.WorkflowStatusId != (int)PMWorkflowStatusEnum.ApprovalChanges)
                {
                    throw new InvalidOperationException("Change Control must be in 'Sent for Approval' or 'Approval Changes' status to approve");
                }

                // Update workflow status
                changeControl.WorkflowStatusId = (int)PMWorkflowStatusEnum.Approved;
                changeControl.UpdatedAt = DateTime.UtcNow;
                changeControl.UpdatedBy = currentUserId;

                // Create history entry
                var history = new ChangeControlWorkflowHistory
                {
                    ChangeControlId = request.EntityId,
                    StatusId = (int)PMWorkflowStatusEnum.Approved,
                    Action = "Approved",
                    Comments = request.Comments,
                    ActionBy = currentUserId,
                    AssignedToId = null // No assignment needed for final approval
                };

                _context.ChangeControlWorkflowHistories.Add(history);
                await _context.SaveChangesAsync(cancellationToken);

                return new PMWorkflowDto
                {
                    Id = history.Id,
                    EntityId = request.EntityId,
                    EntityType = "ChangeControl",
                    StatusId = (int)PMWorkflowStatusEnum.Approved,
                    Status = "Approved",
                    Action = "Approved",
                    Comments = request.Comments,
                    ActionDate = history.ActionDate,
                    ActionBy = currentUserId,
                    ActionByName = currentUser?.UserName ?? "Unknown",
                    AssignedToId = null,
                    AssignedToName = null
                };
            }
            else if (request.EntityType == "ProjectClosure")
            {
                var projectClosure = await _context.ProjectClosures
                    .FirstOrDefaultAsync(p => p.Id == request.EntityId, cancellationToken);

                if (projectClosure == null)
                    throw new Exception($"Project Closure with ID {request.EntityId} not found");

                // Verify current status is SentForApproval or ApprovalChanges
                if (projectClosure.WorkflowStatusId != (int)PMWorkflowStatusEnum.SentForApproval &&
                    projectClosure.WorkflowStatusId != (int)PMWorkflowStatusEnum.ApprovalChanges)
                {
                    throw new InvalidOperationException("Project Closure must be in 'Sent for Approval' or 'Approval Changes' status to approve");
                }

                // Update workflow status
                projectClosure.WorkflowStatusId = (int)PMWorkflowStatusEnum.Approved;
                projectClosure.UpdatedAt = DateTime.UtcNow;
                projectClosure.UpdatedBy = currentUserId;

                // Create history entry
                var history = new ProjectClosureWorkflowHistory
                {
                    ProjectClosureId = request.EntityId,
                    StatusId = (int)PMWorkflowStatusEnum.Approved,
                    Action = "Approved",
                    Comments = request.Comments,
                    ActionBy = currentUserId,
                    AssignedToId = null // No assignment needed for final approval
                };

                _context.ProjectClosureWorkflowHistories.Add(history);
                await _context.SaveChangesAsync(cancellationToken);

                return new PMWorkflowDto
                {
                    Id = history.Id,
                    EntityId = request.EntityId,
                    EntityType = "ProjectClosure",
                    StatusId = (int)PMWorkflowStatusEnum.Approved,
                    Status = "Approved",
                    Action = "Approved",
                    Comments = request.Comments,
                    ActionDate = history.ActionDate,
                    ActionBy = currentUserId,
                    ActionByName = currentUser?.UserName ?? "Unknown",
                    AssignedToId = null,
                    AssignedToName = null
                };
            }

            throw new ArgumentException("Invalid entity type");
        }
    }
}

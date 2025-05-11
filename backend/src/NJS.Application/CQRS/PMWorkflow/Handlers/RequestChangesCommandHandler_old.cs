using MediatR;
using Microsoft.EntityFrameworkCore;
using NJS.Application.CQRS.PMWorkflow.Commands;
using NJS.Application.Dtos;
using NJS.Application.Services.IContract;
using NJS.Domain.Database;
using NJS.Domain.Entities;
using NJS.Domain.Enums;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace NJS.Application.CQRS.PMWorkflow.Handlers
{
    public class RequestChangesCommandHandler_old : IRequestHandler<RequestChangesCommand, PMWorkflowDto>
    {
        private readonly ProjectManagementContext _context;
        private readonly ICurrentUserService _currentUserService;

        public RequestChangesCommandHandler_old(
            ProjectManagementContext context,
            ICurrentUserService currentUserService)
        {
            _context = context;
            _currentUserService = currentUserService;
        }

        public async Task<PMWorkflowDto> Handle(RequestChangesCommand request, CancellationToken cancellationToken)
        {
            string currentUserId = _currentUserService.UserId;
            var currentUser = await _context.Users.FirstOrDefaultAsync(u => u.Id == currentUserId, cancellationToken);

            if (request.EntityType == "ChangeControl")
            {
                var changeControl = await _context.ChangeControls
                    .Include(c => c.WorkflowHistories.OrderByDescending(h => h.ActionDate).Take(1))
                    .FirstOrDefaultAsync(c => c.Id == request.EntityId, cancellationToken);

                if (changeControl == null)
                    throw new Exception($"Change Control with ID {request.EntityId} not found");

                // Determine the new status and assignee based on current status and IsApprovalChanges flag
                int newStatusId;
                string assignedToId;
                string action;

                if (request.IsApprovalChanges.Value)
                {
                    // RM/RD requesting changes from SPM
                    if (changeControl.WorkflowStatusId != (int)PMWorkflowStatusEnum.SentForApproval)
                    {
                        throw new InvalidOperationException("Change Control must be in 'Sent for Approval' status for RM/RD to request changes");
                    }

                    newStatusId = (int)PMWorkflowStatusEnum.ApprovalChanges;
                    action = "Approval Changes";

                    // Find the last person who sent it for approval (SPM)
                    var lastSendToApprovalHistory = await _context.ChangeControlWorkflowHistories
                        .Where(h => h.ChangeControlId == request.EntityId && h.StatusId == (int)PMWorkflowStatusEnum.SentForApproval)
                        .OrderByDescending(h => h.ActionDate)
                        .FirstOrDefaultAsync(cancellationToken);

                    assignedToId = lastSendToApprovalHistory?.ActionBy ?? changeControl.CreatedBy;
                }
                else
                {
                    // SPM requesting changes from PM
                    if (changeControl.WorkflowStatusId != (int)PMWorkflowStatusEnum.SentForReview)
                    {
                        throw new InvalidOperationException("Change Control must be in 'Sent for Review' status for SPM to request changes");
                    }

                    newStatusId = (int)PMWorkflowStatusEnum.ReviewChanges;
                    action = "Review Changes";

                    // Find the last person who sent it for review (PM)
                    var lastSendToReviewHistory = await _context.ChangeControlWorkflowHistories
                        .Where(h => h.ChangeControlId == request.EntityId && h.StatusId == (int)PMWorkflowStatusEnum.SentForReview)
                        .OrderByDescending(h => h.ActionDate)
                        .FirstOrDefaultAsync(cancellationToken);

                    assignedToId = lastSendToReviewHistory?.ActionBy ?? changeControl.CreatedBy;
                }

                // Update workflow status
                changeControl.WorkflowStatusId = newStatusId;
                changeControl.UpdatedAt = DateTime.UtcNow;
                changeControl.UpdatedBy = currentUserId;

                // Create history entry
                var history = new ChangeControlWorkflowHistory
                {
                    ChangeControlId = request.EntityId,
                    StatusId = newStatusId,
                    Action = action,
                    Comments = request.Comments,
                    ActionBy = currentUserId,
                    AssignedToId = assignedToId
                };

                _context.ChangeControlWorkflowHistories.Add(history);
                await _context.SaveChangesAsync(cancellationToken);

                var assignedToUser = await _context.Users.FirstOrDefaultAsync(u => u.Id == assignedToId, cancellationToken);

                return new PMWorkflowDto
                {
                    Id = history.Id,
                    EntityId = request.EntityId,
                    EntityType = "ChangeControl",
                    StatusId = newStatusId,
                    Status = action,
                    Action = action,
                    Comments = request.Comments,
                    ActionDate = history.ActionDate,
                    ActionBy = currentUserId,
                    ActionByName = currentUser?.UserName ?? "Unknown",
                    AssignedToId = assignedToId,
                    AssignedToName = assignedToUser?.UserName ?? "Unknown"
                };
            }
            else if (request.EntityType == "ProjectClosure")
            {
                // Similar implementation for ProjectClosure
                var projectClosure = await _context.ProjectClosures
                    .Include(p => p.WorkflowHistories.OrderByDescending(h => h.ActionDate).Take(1))
                    .FirstOrDefaultAsync(p => p.Id == request.EntityId, cancellationToken);

                if (projectClosure == null)
                    throw new Exception($"Project Closure with ID {request.EntityId} not found");

                // Determine the new status and assignee based on current status and IsApprovalChanges flag
                int newStatusId;
                string assignedToId;
                string action;

                if (request.IsApprovalChanges.Value)
                {
                    // RM/RD requesting changes from SPM
                    if (projectClosure.WorkflowStatusId != (int)PMWorkflowStatusEnum.SentForApproval)
                    {
                        throw new InvalidOperationException("Project Closure must be in 'Sent for Approval' status for RM/RD to request changes");
                    }

                    newStatusId = (int)PMWorkflowStatusEnum.ApprovalChanges;
                    action = "Approval Changes";

                    // Find the last person who sent it for approval (SPM)
                    var lastSendToApprovalHistory = await _context.ProjectClosureWorkflowHistories
                        .Where(h => h.ProjectClosureId == request.EntityId && h.StatusId == (int)PMWorkflowStatusEnum.SentForApproval)
                        .OrderByDescending(h => h.ActionDate)
                        .FirstOrDefaultAsync(cancellationToken);

                    assignedToId = lastSendToApprovalHistory?.ActionBy ?? projectClosure.CreatedBy;
                }
                else
                {
                    // SPM requesting changes from PM
                    if (projectClosure.WorkflowStatusId != (int)PMWorkflowStatusEnum.SentForReview)
                    {
                        throw new InvalidOperationException("Project Closure must be in 'Sent for Review' status for SPM to request changes");
                    }

                    newStatusId = (int)PMWorkflowStatusEnum.ReviewChanges;
                    action = "Review Changes";

                    // Find the last person who sent it for review (PM)
                    var lastSendToReviewHistory = await _context.ProjectClosureWorkflowHistories
                        .Where(h => h.ProjectClosureId == request.EntityId && h.StatusId == (int)PMWorkflowStatusEnum.SentForReview)
                        .OrderByDescending(h => h.ActionDate)
                        .FirstOrDefaultAsync(cancellationToken);

                    assignedToId = lastSendToReviewHistory?.ActionBy ?? projectClosure.CreatedBy;
                }

                // Update workflow status
                projectClosure.WorkflowStatusId = newStatusId;
                projectClosure.UpdatedAt = DateTime.UtcNow;
                projectClosure.UpdatedBy = currentUserId;

                // Create history entry
                var history = new ProjectClosureWorkflowHistory
                {
                    ProjectClosureId = request.EntityId,
                    StatusId = newStatusId,
                    Action = action,
                    Comments = request.Comments,
                    ActionBy = currentUserId,
                    AssignedToId = assignedToId
                };

                _context.ProjectClosureWorkflowHistories.Add(history);
                await _context.SaveChangesAsync(cancellationToken);

                var assignedToUser = await _context.Users.FirstOrDefaultAsync(u => u.Id == assignedToId, cancellationToken);

                return new PMWorkflowDto
                {
                    Id = history.Id,
                    EntityId = request.EntityId,
                    EntityType = "ProjectClosure",
                    StatusId = newStatusId,
                    Status = action,
                    Action = action,
                    Comments = request.Comments,
                    ActionDate = history.ActionDate,
                    ActionBy = currentUserId,
                    ActionByName = currentUser?.UserName ?? "Unknown",
                    AssignedToId = assignedToId,
                    AssignedToName = assignedToUser?.UserName ?? "Unknown"
                };
            }

            throw new ArgumentException("Invalid entity type");
        }
    }
}

using MediatR;
using Microsoft.EntityFrameworkCore;
using NJS.Application.CQRS.PMWorkflow.Commands;
using NJS.Application.Dtos;
using NJS.Application.Services.IContract;
using NJS.Domain.Database;
using NJS.Domain.Entities;
using NJS.Domain.Enums;

namespace NJS.Application.CQRS.PMWorkflow.Handlers
{
    public class SendToApprovalCommandHandler1 : IRequestHandler<ProjectSendToApprovalCommand, PMWorkflowDto>
    {
        private readonly ProjectManagementContext _context;
        private readonly ICurrentUserService _currentUserService;

        public SendToApprovalCommandHandler1(
            ProjectManagementContext context,
            ICurrentUserService currentUserService)
        {
            _context = context;
            _currentUserService = currentUserService;
        }

        public async Task<PMWorkflowDto> Handle(ProjectSendToApprovalCommand request, CancellationToken cancellationToken)
        {
            string currentUserId = _currentUserService.UserId;
            var currentUser = await _context.Users.FirstOrDefaultAsync(u => u.Id == currentUserId, cancellationToken);
            var assignedToUser = await _context.Users.FirstOrDefaultAsync(u => u.Id == request.AssignedToId, cancellationToken);

            if (request.EntityType == "ChangeControl")
            {
                var history = new ChangeControlWorkflowHistory();

                var changeControl = await _context.ChangeControls
                    .FirstOrDefaultAsync(c => c.Id == request.EntityId, cancellationToken);

                if (changeControl == null)
                    throw new Exception($"Change Control with ID {request.EntityId} not found");

                changeControl.UpdatedAt = DateTime.UtcNow;
                changeControl.UpdatedBy = currentUserId;

                if (request.Action == "Approve")
                {
                    changeControl.WorkflowStatusId = (int)PMWorkflowStatusEnum.SentForApproval;

                    history.ChangeControlId = request.EntityId;
                    history.StatusId = (int)PMWorkflowStatusEnum.SentForApproval;
                    history.Action = "Sent for Approval";
                    history.Comments = request.Comments;
                    history.ActionBy = currentUserId;
                    history.AssignedToId = request.AssignedToId;

                }
                else
                {
                    changeControl.WorkflowStatusId = (int)PMWorkflowStatusEnum.ReviewChanges;

                    history.ChangeControlId = request.EntityId;
                    history.StatusId = (int)PMWorkflowStatusEnum.ReviewChanges;
                    history.Action = "Review Changes";
                    history.Comments = request.Comments;
                    history.ActionBy = currentUserId;
                    history.AssignedToId = request.AssignedToId;
                }

                _context.ChangeControlWorkflowHistories.Add(history);
                await _context.SaveChangesAsync(cancellationToken);

                return new PMWorkflowDto
                {
                    Id = history.Id,
                    EntityId = request.EntityId,
                    EntityType = "ChangeControl",
                    StatusId = request.Action == "Approve" ? (int)PMWorkflowStatusEnum.SentForApproval : (int)PMWorkflowStatusEnum.ReviewChanges,
                    Status = request.Action == "Approve" ? "Sent for Approval" : "Review Changes",
                    Action = request.Action == "Approve" ? "Sent for Approval" : "Review Changes",
                    Comments = request.Comments,
                    ActionDate = history.ActionDate,
                    ActionBy = currentUserId,
                    ActionByName = currentUser?.UserName ?? "Unknown",
                    AssignedToId = request.AssignedToId,
                    AssignedToName = assignedToUser?.UserName ?? "Unknown"
                };
            }
            else if (request.EntityType == "ProjectClosure")
            {
                var projectClosure = await _context.ProjectClosures
                    .FirstOrDefaultAsync(p => p.Id == request.EntityId, cancellationToken);

                if (projectClosure == null)
                    throw new Exception($"Project Closure with ID {request.EntityId} not found");

                projectClosure.UpdatedAt = DateTime.UtcNow;
                projectClosure.UpdatedBy = currentUserId;

                var history = new ProjectClosureWorkflowHistory();

                if (request.Action == "Approve")
                {
                    projectClosure.WorkflowStatusId = (int)PMWorkflowStatusEnum.SentForApproval;

                    history.ProjectClosureId = request.EntityId;
                    history.StatusId = (int)PMWorkflowStatusEnum.SentForApproval;
                    history.Action = "Sent for Approval";
                    history.Comments = request.Comments;
                    history.ActionBy = currentUserId;
                    history.AssignedToId = request.AssignedToId;

                }
                else
                {
                    projectClosure.WorkflowStatusId = (int)PMWorkflowStatusEnum.ReviewChanges;

                    history.ProjectClosureId = request.EntityId;
                    history.StatusId = (int)PMWorkflowStatusEnum.ReviewChanges;
                    history.Action = "Review Changes";
                    history.Comments = request.Comments;
                    history.ActionBy = currentUserId;
                    history.AssignedToId = request.AssignedToId;
                }


                _context.ProjectClosureWorkflowHistories.Add(history);
                await _context.SaveChangesAsync(cancellationToken);

                return new PMWorkflowDto
                {
                    Id = history.Id,
                    EntityId = request.EntityId,
                    EntityType = "ProjectClosure",
                    StatusId = request.Action == "Approve" ? (int)PMWorkflowStatusEnum.SentForApproval : (int)PMWorkflowStatusEnum.ReviewChanges,
                    Status = request.Action == "Approve"?"Sent for Approval": "Review Changes",
                    Action = request.Action == "Approve" ? "Sent for Approval" : "Review Changes",
                    Comments = request.Comments,
                    ActionDate = history.ActionDate,
                    ActionBy = currentUserId,
                    ActionByName = currentUser?.UserName ?? "Unknown",
                    AssignedToId = request.AssignedToId,
                    AssignedToName = assignedToUser?.UserName ?? "Unknown"
                };
            }

            throw new ArgumentException("Invalid entity type");
        }
    }
}

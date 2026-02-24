using MediatR;
using Microsoft.EntityFrameworkCore;
using EDR.Application.CQRS.PMWorkflow.Commands;
using EDR.Application.Dtos;
using EDR.Application.Services.IContract;
using EDR.Domain.Database;
using EDR.Domain.Entities;
using EDR.Domain.Enums;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace EDR.Application.CQRS.PMWorkflow.Handlers
{
    public class SendToReviewCommandHandler_old : IRequestHandler<ProjectSendToReviewCommand, PMWorkflowDto>
    {
        private readonly ProjectManagementContext _context;
        private readonly ICurrentUserService _currentUserService;

        public SendToReviewCommandHandler_old(
            ProjectManagementContext context,
            ICurrentUserService currentUserService)
        {
            _context = context;
            _currentUserService = currentUserService;
        }

        public async Task<PMWorkflowDto> Handle(ProjectSendToReviewCommand request, CancellationToken cancellationToken)
        {
            string currentUserId = _currentUserService.UserId;
            var currentUser = await _context.Users.FirstOrDefaultAsync(u => u.Id == currentUserId, cancellationToken);
            var assignedToUser = await _context.Users.FirstOrDefaultAsync(u => u.Id == request.AssignedToId, cancellationToken);

            if (request.EntityType == "ChangeControl")
            {
                var changeControl = await _context.ChangeControls
                    .FirstOrDefaultAsync(c => c.Id == request.EntityId, cancellationToken);

                if (changeControl == null)
                    throw new Exception($"Change Control with ID {request.EntityId} not found");

                // Update workflow status
                changeControl.WorkflowStatusId = (int)PMWorkflowStatusEnum.SentForReview;
                changeControl.UpdatedAt = DateTime.UtcNow;
                changeControl.UpdatedBy = currentUserId;

                // Create history entry
                var history = new ChangeControlWorkflowHistory
                {
                    ChangeControlId = request.EntityId,
                    StatusId = (int)PMWorkflowStatusEnum.SentForReview,
                    Action = "Sent for Review",
                    Comments = request.Comments,
                    ActionBy = currentUserId,
                    AssignedToId = request.AssignedToId
                };

                _context.ChangeControlWorkflowHistories.Add(history);
                await _context.SaveChangesAsync(cancellationToken);

                return new PMWorkflowDto
                {
                    Id = history.Id,
                    EntityId = request.EntityId,
                    EntityType = "ChangeControl",
                    StatusId = (int)PMWorkflowStatusEnum.SentForReview,
                    Status = "Sent for Review",
                    Action = "Sent for Review",
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

                // Update workflow status
                projectClosure.WorkflowStatusId = (int)PMWorkflowStatusEnum.SentForReview;
                projectClosure.UpdatedAt = DateTime.UtcNow;
                projectClosure.UpdatedBy = currentUserId;

                // Create history entry
                var history = new ProjectClosureWorkflowHistory
                {
                    ProjectClosureId = request.EntityId,
                    StatusId = (int)PMWorkflowStatusEnum.SentForReview,
                    Action = "Sent for Review",
                    Comments = request.Comments,
                    ActionBy = currentUserId,
                    AssignedToId = request.AssignedToId
                };

                _context.ProjectClosureWorkflowHistories.Add(history);
                await _context.SaveChangesAsync(cancellationToken);

                return new PMWorkflowDto
                {
                    Id = history.Id,
                    EntityId = request.EntityId,
                    EntityType = "ProjectClosure",
                    StatusId = (int)PMWorkflowStatusEnum.SentForReview,
                    Status = "Sent for Review",
                    Action = "Sent for Review",
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


using Microsoft.EntityFrameworkCore;
using EDR.Application.CQRS.PMWorkflow.Commands;
using EDR.Application.Dtos;
using EDR.Application.Services.IContract;
using EDR.Domain.Database;
using EDR.Domain.Entities;
using EDR.Domain.Enums;

namespace EDR.Application.Services
{
    public class ChangeControlWorkflowStrategy : IEntityWorkflowStrategy
    {
        private readonly ProjectManagementContext _context;

        public ChangeControlWorkflowStrategy(ProjectManagementContext context)
        {
            _context = context;
        }
        public string EntityType => "ChangeControl";

        public async Task<PMWorkflowDto> ExecuteAsync(WorkflowActionContext context, CancellationToken cancellationToken)
        {
            var currentUserId = context.CurrentUser.Id;
            var changeControl = await _context.ChangeControls.FirstOrDefaultAsync(c => c.Id == context.EntityId, cancellationToken);
            if (changeControl == null)
                throw new Exception($"Change Control with ID {context.EntityId} not found");

            PMWorkflowStatusEnum status = context.Action switch
            {
                "Approval" => PMWorkflowStatusEnum.SentForApproval,
                "Review" => PMWorkflowStatusEnum.SentForReview,
                "Reject" => PMWorkflowStatusEnum.ReviewChanges,
                "Approval Changes" => PMWorkflowStatusEnum.ApprovalChanges,
                "Approved" => PMWorkflowStatusEnum.Approved,
                _ => throw new ArgumentException("Unknown action")
            };

            changeControl.WorkflowStatusId = (int)status;
            changeControl.UpdatedAt = DateTime.UtcNow;
            changeControl.UpdatedBy = currentUserId;

            var history = new ChangeControlWorkflowHistory
            {
                ChangeControlId = context.EntityId,
                StatusId = (int)status,
                Action = $"Sent for {context.Action}",
                Comments = context.Comments,
                ActionBy = currentUserId,
                AssignedToId = context.AssignedToId
            };

            _context.ChangeControlWorkflowHistories.Add(history);
            await _context.SaveChangesAsync(cancellationToken);

            return new PMWorkflowDto
            {
                Id = history.Id,
                EntityId = context.EntityId,
                EntityType = EntityType,
                StatusId = history.StatusId,
                Status = history.Action,
                Action = history.Action,
                Comments = history.Comments,
                ActionDate = history.ActionDate,
                ActionBy = currentUserId,
                ActionByName = context.CurrentUser?.UserName ?? "Unknown",
                AssignedToId = context.AssignedToId,
                AssignedToName = context.AssignedToUser?.UserName ?? "Unknown"
            };
        }
    }
}



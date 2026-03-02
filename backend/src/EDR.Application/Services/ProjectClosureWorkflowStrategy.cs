using Microsoft.EntityFrameworkCore;
using EDR.Application.CQRS.PMWorkflow.Commands;
using EDR.Application.Dtos;
using EDR.Application.Services.IContract;
using EDR.Domain.Database;
using EDR.Domain.Entities;
using EDR.Domain.Enums;

namespace EDR.Application.Services
{
    public class ProjectClosureWorkflowStrategy : IEntityWorkflowStrategy
    {
        private readonly ProjectManagementContext _context;

        public ProjectClosureWorkflowStrategy(ProjectManagementContext context)
        {
            _context = context;
        }
        public string EntityType => "ProjectClosure";

        public async Task<PMWorkflowDto> ExecuteAsync(WorkflowActionContext context, CancellationToken cancellationToken)
        {
            var projectClosure = await _context.ProjectClosures
             .FirstOrDefaultAsync(p => p.Id == context.EntityId, cancellationToken);

            if (projectClosure == null)
                throw new Exception($"Project Closure with ID {context.EntityId} not found");

            var currentUserId = context.CurrentUser.Id;
            PMWorkflowStatusEnum status = context.Action switch
            {
                "Approval" => PMWorkflowStatusEnum.SentForApproval,
                "Review" => PMWorkflowStatusEnum.SentForReview,
                "Reject" => PMWorkflowStatusEnum.ReviewChanges,
                "Approval Changes" => PMWorkflowStatusEnum.ApprovalChanges,
                "Approved" => PMWorkflowStatusEnum.Approved,
                _ => throw new ArgumentException("Unknown action")
            };

            projectClosure.WorkflowStatusId = (int)status;
            projectClosure.UpdatedAt = DateTime.UtcNow;
            projectClosure.UpdatedBy = currentUserId;

            var history = new ProjectClosureWorkflowHistory
            {
                ProjectClosureId = context.EntityId,
                StatusId = (int)status,
                Action = $"Sent for {context.Action}",
                Comments = context.Comments,
                ActionBy = currentUserId,
                AssignedToId = context.AssignedToId
            };

            _context.ProjectClosureWorkflowHistories.Add(history);
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



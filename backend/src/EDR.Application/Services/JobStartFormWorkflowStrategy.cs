using Microsoft.EntityFrameworkCore;
using EDR.Application.Dtos;
using EDR.Application.Services.IContract;
using EDR.Domain.Database;
using EDR.Domain.Entities;
using EDR.Domain.Enums;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace EDR.Application.Services
{
    public class JobStartFormWorkflowStrategy : IEntityWorkflowStrategy
    {
        private readonly ProjectManagementContext _context;
        private readonly ICurrentUserService _currentUserService;

        public string EntityType => "JobStartForm";

        public JobStartFormWorkflowStrategy(ProjectManagementContext context, ICurrentUserService currentUserService)
        {
            _context = context;
            _currentUserService = currentUserService;
        }

        public async Task<PMWorkflowDto> ExecuteAsync(WorkflowActionContext context, CancellationToken cancellationToken)
        {
            // Get the current user ID
            var currentUserId = _currentUserService.UserId;

            // Find the JobStartForm
            var jobStartForm = await _context.JobStartForms
                .FirstOrDefaultAsync(f => f.FormId == context.EntityId, cancellationToken);

            if (jobStartForm == null)
            {
                throw new ApplicationException($"JobStartForm with ID {context.EntityId} not found");
            }

            // Find or create the JobStartFormHeader
            var jobStartFormHeader = await _context.JobStartFormHeaders
                .FirstOrDefaultAsync(h => h.FormId == jobStartForm.FormId, cancellationToken);

            if (jobStartFormHeader == null)
            {
                // Create a new header if it doesn't exist
                jobStartFormHeader = new JobStartFormHeader
                {
                    FormId = jobStartForm.FormId,
                    ProjectId = jobStartForm.ProjectId,
                    CreatedAt = DateTime.UtcNow,
                    CreatedBy = currentUserId,
                    StatusId = (int)PMWorkflowStatusEnum.Initial
                };

                _context.JobStartFormHeaders.Add(jobStartFormHeader);
                await _context.SaveChangesAsync(cancellationToken);
            }

            // Determine the new status based on the action and current status
            PMWorkflowStatusEnum status;
            if (context.Action == "Reject")
            {
                // If this is an RM/RD rejection (IsApprovalChanges is true), use "Approval Changes" (5)
                // Otherwise, use "Review Changes" (3)
                status = context.IsApprovalChanges ?
                    PMWorkflowStatusEnum.ApprovalChanges :
                    PMWorkflowStatusEnum.ReviewChanges;
            }
            else
            {
                // For other actions, use the standard mapping
                status = context.Action switch
                {
                    "Review" => PMWorkflowStatusEnum.SentForReview,
                    "Approval" => PMWorkflowStatusEnum.SentForApproval,
                    "Approval Changes" => PMWorkflowStatusEnum.ApprovalChanges,
                    "Approved" => PMWorkflowStatusEnum.Approved,
                    _ => throw new ArgumentException($"Unknown action: {context.Action}")
                };
            }

            // Create a new history entry
            var history = new JobStartFormHistory
            {
                JobStartFormHeaderId = jobStartFormHeader.Id,
                StatusId = (int)status,
                Action = context.Action,
                Comments = context.Comments ?? $"JobStartForm {status.ToString()} action",
                ActionDate = DateTime.UtcNow,
                ActionBy = currentUserId,
                AssignedToId = context.AssignedToId
            };

            // Update the header status
            jobStartFormHeader.StatusId = (int)status;

            // Save the changes
            _context.JobStartFormHistories.Add(history);
            await _context.SaveChangesAsync(cancellationToken);

            // Get the status name
            var statusName = await _context.PMWorkflowStatuses
                .Where(s => s.Id == (int)status)
                .Select(s => s.Status)
                .FirstOrDefaultAsync(cancellationToken);

            // Get user names
            var actionUser = await _context.Users.FirstOrDefaultAsync(u => u.Id == currentUserId, cancellationToken);
            var assignedToUser = context.AssignedToId != null ?
                await _context.Users.FirstOrDefaultAsync(u => u.Id == context.AssignedToId, cancellationToken) : null;

            // Return the DTO
            return new PMWorkflowDto
            {
                Id = history.Id,
                EntityId = jobStartForm.FormId,
                EntityType = "JobStartForm",
                StatusId = (int)status,
                Status = statusName,
                Action = context.Action,
                Comments = context.Comments,
                ActionDate = history.ActionDate,
                ActionBy = currentUserId,
                ActionByName = actionUser?.UserName,
                AssignedToId = context.AssignedToId,
                AssignedToName = assignedToUser?.UserName
            };
        }
    }
}


using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using EDR.Application.Dtos;
using EDR.Application.Services.IContract;
using EDR.Domain.Database;
using EDR.Domain.Entities;
using EDR.Domain.Enums;
using EDR.Repositories.Interfaces;

namespace EDR.Application.Services
{
    public class WBSVersionWorkflowStrategy : IEntityWorkflowStrategy
    {
        private readonly ProjectManagementContext _context;
        private readonly IWBSVersionRepository _wbsVersionRepository;
        private readonly ILogger<WBSVersionWorkflowStrategy> _logger;

        public WBSVersionWorkflowStrategy(
            ProjectManagementContext context, 
            IWBSVersionRepository wbsVersionRepository,
            ILogger<WBSVersionWorkflowStrategy> logger)
        {
            _context = context;
            _wbsVersionRepository = wbsVersionRepository;
            _logger = logger;
        }

        public string EntityType => "WBSVersion";

        public async Task<PMWorkflowDto> ExecuteAsync(WorkflowActionContext context, CancellationToken cancellationToken)
        {
            var wbsVersion = await _context.WBSVersionHistories
                .Include(v => v.WBSHeader)
                .FirstOrDefaultAsync(v => v.Id == context.EntityId, cancellationToken);

            if (wbsVersion == null)
                throw new Exception($"WBS Version with ID {context.EntityId} not found");

            var currentUserId = context.CurrentUser.Id;

            // Check if this is a rejection from RM/RD
            bool isFromSentForApproval = false;

            // Get the most recent history entry to determine the current status
            var latestHistory = await _wbsVersionRepository.GetLatestWorkflowHistoryAsync(wbsVersion.Id);
            if (latestHistory != null)
            {
                isFromSentForApproval = latestHistory.StatusId == (int)PMWorkflowStatusEnum.SentForApproval;
                _logger.LogInformation($"WBSVersionWorkflowStrategy: Latest history status: {latestHistory.StatusId}, isFromSentForApproval: {isFromSentForApproval}");
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

                _logger.LogInformation($"WBSVersionWorkflowStrategy: Rejection detected. IsApprovalChanges: {context.IsApprovalChanges}, Using status: {status} ({(int)status})");
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

            // Create a new workflow history entry
            var workflowHistory = new WBSVersionWorkflowHistory
            {
                WBSVersionHistoryId = wbsVersion.Id,
                StatusId = (int)status,
                Action = context.Action,
                Comments = context.Comments ?? $"WBS Version {status.ToString()} action",
                ActionDate = DateTime.UtcNow,
                ActionBy = currentUserId,
                AssignedToId = context.AssignedToId
            };

            // Update the version status
            wbsVersion.StatusId = (int)status;

            // Sync WBSHeader status
            if (wbsVersion.WBSHeader != null)
            {
                wbsVersion.WBSHeader.ApprovalStatus = status;
                _context.WBSHeaders.Update(wbsVersion.WBSHeader);

                // Bidirectional sync: Also update WBSTaskPlannedHourHeaders and their histories
                var projectId = wbsVersion.WBSHeader.ProjectId;
                var plannedHourHeaders = await _context.Set<WBSTaskPlannedHourHeader>()
                    .Where(h => h.ProjectId == projectId)
                    .ToListAsync(cancellationToken);

                foreach (var phHeader in plannedHourHeaders)
                {
                    phHeader.StatusId = (int)status;
                    _context.Set<WBSTaskPlannedHourHeader>().Update(phHeader);

                    // Add to WBSHistory for backward compatibility
                    var phHistory = new WBSHistory
                    {
                        WBSTaskPlannedHourHeaderId = phHeader.Id,
                        StatusId = (int)status,
                        Action = context.Action,
                        Comments = context.Comments ?? $"WBS Version {status.ToString()} action (Sync)",
                        ActionDate = DateTime.UtcNow,
                        ActionBy = currentUserId,
                        AssignedToId = context.AssignedToId
                    };
                    _context.WBSHistories.Add(phHistory);
                }
            }

            // If approved, set approval metadata
            if (status == PMWorkflowStatusEnum.Approved)
            {
                wbsVersion.ApprovedAt = DateTime.UtcNow;
                wbsVersion.ApprovedBy = currentUserId;
            }

            // Save the workflow history
            await _wbsVersionRepository.CreateWorkflowHistoryAsync(workflowHistory);

            // Update the version
            await _wbsVersionRepository.UpdateVersionAsync(wbsVersion);

            // Log the status update
            _logger.LogInformation($"WBS Version {wbsVersion.Id} status updated to {status} by user {currentUserId}");

            // Get user names for response
            var actionUser = await _context.Users.FirstOrDefaultAsync(u => u.Id == currentUserId, cancellationToken);
            var assignedToUser = context.AssignedToId != null ?
                await _context.Users.FirstOrDefaultAsync(u => u.Id == context.AssignedToId, cancellationToken) : null;

            // Return the workflow DTO
            return new PMWorkflowDto
            {
                Id = workflowHistory.Id,
                EntityId = context.EntityId,
                EntityType = "WBSVersion",
                StatusId = (int)status,
                Status = status.ToString(),
                Action = context.Action,
                Comments = context.Comments,
                ActionDate = workflowHistory.ActionDate,
                ActionBy = currentUserId,
                ActionByName = actionUser?.UserName ?? "Unknown",
                AssignedToId = context.AssignedToId,
                AssignedToName = assignedToUser?.UserName ?? "Unknown"
            };
        }
    }
} 

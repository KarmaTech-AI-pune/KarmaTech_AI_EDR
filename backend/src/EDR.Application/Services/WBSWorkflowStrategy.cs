using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using EDR.Application.Dtos;
using EDR.Application.Services.IContract;
using EDR.Domain.Database;
using EDR.Domain.Entities;
using EDR.Domain.Enums;

namespace EDR.Application.Services
{
    public class WBSWorkflowStrategy : IEntityWorkflowStrategy
    {
        private readonly ProjectManagementContext _context;
        private readonly ILogger<WBSWorkflowStrategy> _logger;

        public WBSWorkflowStrategy(ProjectManagementContext context, ILogger<WBSWorkflowStrategy> logger)
        {
            _context = context;
            _logger = logger;
        }

        public string EntityType => "WBS";

        public async Task<PMWorkflowDto> ExecuteAsync(WorkflowActionContext context, CancellationToken cancellationToken)
        {
            var wbsHeader = await _context.Set<WBSTaskPlannedHourHeader>()
                .Include(w => w.WBSHistories)
                .FirstOrDefaultAsync(w => w.Id == context.EntityId, cancellationToken);

            if (wbsHeader == null)
                throw new Exception($"WBS Header with ID {context.EntityId} not found");

            var currentUserId = context.CurrentUser.Id;

            // Check if this is a rejection from RM/RD
            bool isFromSentForApproval = false;

            // Get the most recent history entry to determine the current status
            var latestHistory = wbsHeader.WBSHistories
                .OrderByDescending(h => h.ActionDate)
                .FirstOrDefault();

            if (latestHistory != null)
            {
                isFromSentForApproval = latestHistory.StatusId == (int)PMWorkflowStatusEnum.SentForApproval;
                _logger.LogInformation($"WBSWorkflowStrategy: Latest history status: {latestHistory.StatusId}, isFromSentForApproval: {isFromSentForApproval}");
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

                _logger.LogInformation($"WBSWorkflowStrategy: Rejection detected. IsApprovalChanges: {context.IsApprovalChanges}, Using status: {status} ({(int)status})");
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
            var history = new WBSHistory
            {
                WBSTaskPlannedHourHeaderId = wbsHeader.Id,
                StatusId = (int)status,
                Action = context.Action,
                Comments = context.Comments ?? $"WBS {status.ToString()} action",
                ActionDate = DateTime.UtcNow,
                ActionBy = currentUserId,
                AssignedToId = context.AssignedToId
            };

            wbsHeader.WBSHistories.Add(history);

            if (status == PMWorkflowStatusEnum.Approved)
            {
                try
                {
                    wbsHeader.StatusId = (int)status;
                }
                catch (Exception ex)
                {

                    _logger.LogInformation($"Error setting approval status: {ex.Message}");

                }
            }

            // Add the history entry
            _context.WBSHistories.Add(history);
            wbsHeader.StatusId = (int)status;
            _context.WBSTaskPlannedHourHeaders.Update(wbsHeader);

            // Sync with the main WBSHeader for versioning logic
            var mainHeader = await _context.WBSHeaders
                .FirstOrDefaultAsync(h => h.ProjectId == wbsHeader.ProjectId && h.IsActive, cancellationToken);
            if (mainHeader != null)
            {
                mainHeader.ApprovalStatus = status;
                _context.WBSHeaders.Update(mainHeader);

                // Create a WBSVersionWorkflowHistory entry for the latest version if it exists
                var latestVersion = await _context.WBSVersionHistories
                    .Where(v => v.WBSHeaderId == mainHeader.Id && v.IsLatest)
                    .FirstOrDefaultAsync(cancellationToken);

                if (latestVersion != null)
                {
                    var versionHistory = new WBSVersionWorkflowHistory
                    {
                        WBSVersionHistoryId = latestVersion.Id,
                        StatusId = (int)status,
                        Action = context.Action,
                        Comments = context.Comments ?? $"WBS {status.ToString()} action",
                        ActionDate = DateTime.UtcNow,
                        ActionBy = currentUserId,
                        AssignedToId = context.AssignedToId,
                        TenantId = latestVersion.TenantId
                    };
                    _context.WBSVersionWorkflowHistories.Add(versionHistory);

                    // Also sync the version status
                    latestVersion.StatusId = (int)status;
                    _context.WBSVersionHistories.Update(latestVersion);
                }
            }

            // Save changes to the database
            await _context.SaveChangesAsync(cancellationToken);

            // Log the status update
            _logger.LogInformation($"WBS Header {wbsHeader.Id} status updated to {status} by user {currentUserId}");

            // Return the workflow DTO
            return new PMWorkflowDto
            {
                Id = history.Id,
                EntityId = context.EntityId,
                EntityType = "WBS",
                StatusId = (int)status,
                Status = status.ToString(),
                Action = context.Action,
                Comments = context.Comments,
                ActionDate = history.ActionDate,
                ActionBy = currentUserId,
                ActionByName = context.CurrentUser?.UserName ?? "Unknown",
                AssignedToId = context.AssignedToId,
                AssignedToName = context.AssignedToUser?.UserName ?? "Unknown"
            };
        }
    }
}


﻿using Microsoft.EntityFrameworkCore;
using NJS.Application.Dtos;
using NJS.Application.Services.IContract;
using NJS.Domain.Database;
using NJS.Domain.Entities;
using NJS.Domain.Enums;

namespace NJS.Application.Services
{
    public class WBSWorkflowStrategy : IEntityWorkflowStrategy
    {
        private readonly ProjectManagementContext _context;

        public WBSWorkflowStrategy(ProjectManagementContext context)
        {
            _context = context;
        }

        public string EntityType => "WBS";

        public async Task<PMWorkflowDto> ExecuteAsync(WorkflowActionContext context, CancellationToken cancellationToken)
        {
            var wbsHeader = await _context.Set<WBSTaskMonthlyHourHeader>()
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
                Console.WriteLine($"WBSWorkflowStrategy: Latest history status: {latestHistory.StatusId}, isFromSentForApproval: {isFromSentForApproval}");
            }

            // Determine the new status based on the action and current status
            PMWorkflowStatusEnum status;
            if (context.Action == "Reject")
            {
                // If rejecting from "Sent for Approval" status, use "Approval Changes" (5)
                // Otherwise, use "Review Changes" (3)
                status = isFromSentForApproval ?
                    PMWorkflowStatusEnum.ApprovalChanges :
                    PMWorkflowStatusEnum.ReviewChanges;

                Console.WriteLine($"WBSWorkflowStrategy: Rejection detected. Using status: {status} ({(int)status})");
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
                WBSTaskMonthlyHourHeaderId = wbsHeader.Id,
                StatusId = (int)status,
                Action = context.Action,
                Comments = context.Comments ?? $"WBS {status.ToString()} action",
                ActionDate = DateTime.UtcNow,
                ActionBy = currentUserId,
                AssignedToId = context.AssignedToId
            };

            // Add the history entry to the WBS header
            wbsHeader.WBSHistories.Add(history);

            // Update the status in the database
            // For the "Approved" status, we need to ensure it's properly saved
            if (status == PMWorkflowStatusEnum.Approved)
            {
                try
                {
                    // Create a direct property on the header to track the status
                    // This ensures the status is saved even if the history entry is lost
                    wbsHeader.StatusId = (int)status;

                    // Log the approval
                    Console.WriteLine($"WBS Header {wbsHeader.Id} APPROVED by user {currentUserId}");
                }
                catch (Exception ex)
                {
                    // Log any errors that occur during approval
                    Console.WriteLine($"Error setting approval status: {ex.Message}");
                    throw;
                }
            }

            // Add the history entry
            _context.WBSHistories.Add(history);

            // Save changes to the database
            await _context.SaveChangesAsync(cancellationToken);

            // Log the status update
            Console.WriteLine($"WBS Header {wbsHeader.Id} status updated to {status} by user {currentUserId}");

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

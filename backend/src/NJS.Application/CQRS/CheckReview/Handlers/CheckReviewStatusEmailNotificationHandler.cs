using MediatR;
using NJS.Application.Services.IContract;
using NJS.Domain.Models;
using NJS.Domain.Enums;
using Microsoft.Extensions.Logging;
using NJS.Application.CQRS.CheckReview.Notifications; // Reference to the new notification

namespace NJS.Application.CQRS.CheckReview.Handlers;

public class CheckReviewStatusEmailNotificationHandler : INotificationHandler<CheckReviewStatusEmailNotification>
{
    private readonly IEmailService _emailService;
    private readonly ILogger<CheckReviewStatusEmailNotificationHandler> _logger;

    public CheckReviewStatusEmailNotificationHandler(IEmailService emailService, ILogger<CheckReviewStatusEmailNotificationHandler> logger)
    {
        _emailService = emailService;
        _logger = logger;
    }

    public async Task Handle(CheckReviewStatusEmailNotification notification, CancellationToken cancellationToken)
    {
        try 
        {
            var subject = GetEmailSubject(notification.NewStatus, notification.CheckReview.ActivityName);
            var body = GetEmailBody(notification);

            var message = new EmailMessage
            {
                To = notification.RecipientEmail,
                Subject = subject,
                Body = body,
                IsHtml = true
            };

            await _emailService.SendEmailAsync(message);
        }
        catch (Exception ex)
        {
            // Log error but don't throw - fail silently for email notifications
            _logger.LogError($"Email sending failed: {ex.Message}");
        }
    }

    private string GetEmailSubject(PMWorkflowStatusEnum status, string checkReviewName)
    {
        return status switch
        {
            PMWorkflowStatusEnum.SentForReview => $"Check Review Request: {checkReviewName}",
            PMWorkflowStatusEnum.Initial => $"Check Review created: {checkReviewName}",
            PMWorkflowStatusEnum.ApprovalChanges => $"Check Review rejected: {checkReviewName}", // Assuming ApprovalChanges means rejection in this context
            PMWorkflowStatusEnum.ReviewChanges => $"Check Review changes requested: {checkReviewName}",
            PMWorkflowStatusEnum.SentForApproval => $"Check Review Sent for Approval: {checkReviewName}",
            PMWorkflowStatusEnum.Approved => $"Check Review Approved: {checkReviewName}",
            _ => $"Check Review Status Update: {checkReviewName}"
        };
    }

    private string GetEmailBody(CheckReviewStatusEmailNotification notification)
    {
        var statusAction = notification.NewStatus switch
        {
            PMWorkflowStatusEnum.SentForReview => "sent for review",
            PMWorkflowStatusEnum.Initial => "under preparation",
            PMWorkflowStatusEnum.ApprovalChanges => "rejected",
            PMWorkflowStatusEnum.Approved => "approved",
            PMWorkflowStatusEnum.ReviewChanges => "changes requested",
            _ => "updated"
        };

        return $@"
            <h2>Check Review Status Update</h2>
            <p>The check review <strong>{notification.CheckReview.ActivityName}</strong> has been {statusAction}.</p>
            
            <h3>Check Review Details:</h3>
            <ul>
                <li>Activity Name: {notification.CheckReview.ActivityName}</li>
                <li>Status: {notification.NewStatus.ToString().Replace("_", " ")}</li>
                <li>Action By: {notification.ActionBy}</li>
            </ul>

            <h3>Comments:</h3>
            <p>{notification.Comments}</p>

            <p>Please review and take necessary action.</p>
            
            <p>Best regards,<br>NJS Project Management Team</p>";
    }
}

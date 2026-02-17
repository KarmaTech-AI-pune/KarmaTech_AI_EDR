using MediatR;
using EDR.Application.Services.IContract;
using EDR.Domain.Models;
using EDR.Domain.Entities;
using EDR.Domain.Enums;

namespace EDR.Application.CQRS.Email.Notifications;

public class OpportunityStatusEmailNotification : INotification
{
    public EDR.Domain.Entities.OpportunityTracking Opportunity { get; }
    public string ActionBy { get; }
    public OpportunityWorkFlowStatus NewStatus { get; }
    public string Comments { get; }
    public string RecipientEmail { get; }

    public OpportunityStatusEmailNotification(
        EDR.Domain.Entities.OpportunityTracking opportunity,
        string actionBy,
        OpportunityWorkFlowStatus newStatus,
        string comments,
        string recipientEmail)
    {
        Opportunity = opportunity;
        ActionBy = actionBy;
        NewStatus = newStatus;
        Comments = comments;
        RecipientEmail = recipientEmail;
    }
}

public class OpportunityStatusEmailNotificationHandler : INotificationHandler<OpportunityStatusEmailNotification>
{
    private readonly IEmailService _emailService;

    public OpportunityStatusEmailNotificationHandler(IEmailService emailService)
    {
        _emailService = emailService;
    }

    public async Task Handle(OpportunityStatusEmailNotification notification, CancellationToken cancellationToken)
    {
        var subject = GetEmailSubject(notification.NewStatus, notification.Opportunity.WorkName);
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

    private string GetEmailSubject(OpportunityWorkFlowStatus status, string opportunityName)
    {
        return status switch
        {
            OpportunityWorkFlowStatus.SentForReview => $"Opportunity Review Request: {opportunityName}",
            OpportunityWorkFlowStatus.Initial => $"Opportunity created: {opportunityName}",
            OpportunityWorkFlowStatus.ApprovalChanges => $"Opportunity rejected by RD: {opportunityName}",
            OpportunityWorkFlowStatus.ReviewChanges => $"Opportunity rejected by RM: {opportunityName}",
            OpportunityWorkFlowStatus.SentForApproval => $"Opportunity Sent for Approval by RM to RD: {opportunityName}",
            OpportunityWorkFlowStatus.Approved => $"Opportunity Approved by RD: {opportunityName}",
            _ => $"Opportunity Status Update: {opportunityName}"
        };
    }

    private string GetEmailBody(OpportunityStatusEmailNotification notification)
    {
        var statusAction = notification.NewStatus switch
        {
            OpportunityWorkFlowStatus.SentForReview => "sent for review",
            OpportunityWorkFlowStatus.Initial => "under preparation",
            OpportunityWorkFlowStatus.ApprovalChanges => "under review",
            OpportunityWorkFlowStatus.Approved => "accepted",
            OpportunityWorkFlowStatus.ReviewChanges => "rejected",
            _ => "updated"
        };

        return $@"
            <h2>Opportunity Status Update</h2>
            <p>The opportunity <strong>{notification.Opportunity.WorkName}</strong> has been {statusAction}.</p>
            
            <h3>Opportunity Details:</h3>
            <ul>
                <li>Client: {notification.Opportunity.Client}</li>
                <li>Work Name: {notification.Opportunity.WorkName}</li>
                <li>Status: {notification.NewStatus}</li>
                <li>Action By: {notification.ActionBy}</li>
            </ul>

            <h3>Comments:</h3>
            <p>{notification.Comments}</p>

            <p>Please review and take necessary action.</p>
            
            <p>Best regards,<br>NJS Project Management Team</p>";
    }
}


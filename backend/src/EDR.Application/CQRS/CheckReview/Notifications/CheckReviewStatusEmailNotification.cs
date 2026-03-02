using MediatR;
using EDR.Domain.Entities; // Assuming CheckReview entity is here
using EDR.Domain.Enums;

namespace EDR.Application.CQRS.CheckReview.Notifications;

public class CheckReviewStatusEmailNotification : INotification
{
    public EDR.Domain.Entities.CheckReview CheckReview { get; }
    public string ActionBy { get; }
    public string Comments { get; }
    public string RecipientEmail { get; }
    public PMWorkflowStatusEnum NewStatus { get; }

    public CheckReviewStatusEmailNotification(
        EDR.Domain.Entities.CheckReview checkReview,
        string actionBy,
        string comments,
        string recipientEmail,
        PMWorkflowStatusEnum newStatus)
    {
        CheckReview = checkReview;
        ActionBy = actionBy;
        Comments = comments;
        RecipientEmail = recipientEmail;
        NewStatus = newStatus;
    }
}


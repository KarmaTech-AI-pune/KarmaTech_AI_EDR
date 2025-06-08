using MediatR;
using NJS.Domain.Entities; // Assuming CheckReview entity is here
using NJS.Domain.Enums;

namespace NJS.Application.CQRS.CheckReview.Notifications;

public class CheckReviewStatusEmailNotification : INotification
{
    public NJS.Domain.Entities.CheckReview CheckReview { get; }
    public string ActionBy { get; }
    public string Comments { get; }
    public string RecipientEmail { get; }
    public PMWorkflowStatusEnum NewStatus { get; }

    public CheckReviewStatusEmailNotification(
        NJS.Domain.Entities.CheckReview checkReview,
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

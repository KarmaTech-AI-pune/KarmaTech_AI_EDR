using System.ComponentModel;

namespace NJS.Domain.Enums
{
    public enum PMWorkflowStatusEnum
    {
        [Description("Initial")]
        Initial = 1,
        
        [Description("Sent for Review")]
        SentForReview = 2,
        
        [Description("Review Changes")]
        ReviewChanges = 3,
        
        [Description("Sent for Approval")]
        SentForApproval = 4,
        
        [Description("Approval Changes")]
        ApprovalChanges = 5,
        
        [Description("Approved")]
        Approved = 6
    }
}

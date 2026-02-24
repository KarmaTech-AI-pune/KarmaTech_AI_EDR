using System.ComponentModel;

namespace EDR.Domain.Enums
{
    public enum OpportunityTrackingStatus
    {
        [Description("Bid Under Preparation")]
        BID_UNDER_PREPERATION,

        [Description("Bid Submitted")]
        BID_SUBMITTED,

        [Description("Bid Rejected")]
        BID_REJECTED,

        [Description("Bid Accepted")]
        BID_ACCEPTED,
        SentForReview
    }

    public enum OpportunityWorkFlowStatus
    {
        Initial =0,      
        SentForReview=1,
        ReviewChanges=2,
        SentForApproval=3,
        ApprovalChanges=4,
        Approved=5
    }
}


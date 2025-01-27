using System.ComponentModel;

namespace NJS.Domain.Enums
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
        BID_ACCEPTED
    }
}

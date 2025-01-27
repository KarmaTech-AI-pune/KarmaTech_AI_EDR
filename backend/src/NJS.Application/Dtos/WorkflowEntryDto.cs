using System;

namespace NJS.Application.Dtos
{
    public enum FormStage
    {
        OpportunityTracking,
        GoNoGo,
        BidPreparation,
        BidSubmitted,
        BidAccepted,
        BidRejected
    }

    public class WorkflowEntryDto
    {
        public int Id { get; set; }
        public int OpportunityId { get; set; }
        public FormStage FormStage { get; set; }
        public int WorkflowId { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}

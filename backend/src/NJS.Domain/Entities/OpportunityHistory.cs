namespace NJS.Domain.Entities
{
    public class OpportunityHistory
    {
        public int Id { get; set; }
        public int OpportunityId { get; set; }
        public OpportunityTracking Opportunity { get; set; }
        public int StatusId { get; set; }
        public OpportunityStatus Status { get; set; }
        public string Action { get; set; }
        public string Comments { get; set; }
        public DateTime ActionDate { get; set; }
        public string ActionBy { get; set; }
        public User ActionUser { get; set; }

        public string? Ma { get; set; }
        public User ActionUser { get; set; }
    }
}

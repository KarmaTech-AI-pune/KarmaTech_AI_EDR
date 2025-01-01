using System.ComponentModel.DataAnnotations.Schema;

namespace NJS.Domain.Entities
{
    /// <summary>
    /// This is model used to opportunity workflow
    /// </summary>
    public class OpportunityHistory
    {
        public OpportunityHistory()
        {
            ActionDate = DateTime.UtcNow;
        }
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

        public string? AssignedToId { get; set; }

        [ForeignKey("AssignedToId")]
        public User AssignedTo { get; set; }

    }
}

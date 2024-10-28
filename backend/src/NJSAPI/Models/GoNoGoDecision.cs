namespace NJSAPI.Models
{
    public class GoNoGoDecision
    {
        public int Id { get; set; }
        public int ProjectId { get; set; }
        public bool Decision { get; set; }
        public string Rationale { get; set; }
        public DateTime DecisionDate { get; set; }
        public string DecisionMaker { get; set; }
    }
}
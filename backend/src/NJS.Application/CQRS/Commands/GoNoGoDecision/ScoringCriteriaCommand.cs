namespace NJS.Application.CQRS.Commands.GoNoGoDecision
{
    public class ScoringCriteriaCommand
    {
        public class CriteriaItem
        {
            public string Comments { get; set; }
            public int Score { get; set; }
            public int ScoringDescriptionId { get; set; }
        }

        public CriteriaItem MarketingPlan { get; set; }
        public CriteriaItem Profitability { get; set; }
        public CriteriaItem ProjectKnowledge { get; set; }
        public CriteriaItem ResourceAvailability { get; set; }
        public CriteriaItem StaffAvailability { get; set; }
        public CriteriaItem TechnicalEligibility { get; set; }
        public CriteriaItem ClientRelationship { get; set; }
        public CriteriaItem CompetitionAssessment { get; set; }
        public CriteriaItem CompetitivePosition { get; set; }
        public CriteriaItem FutureWorkPotential { get; set; }
        public CriteriaItem BidSchedule { get; set; }
        public CriteriaItem FinancialEligibility { get; set; }
    }
}

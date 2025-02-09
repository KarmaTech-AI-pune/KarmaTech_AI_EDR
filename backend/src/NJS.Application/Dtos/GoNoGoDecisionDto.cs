using NJS.Domain.Enums;
using System;

namespace NJS.Application.Dtos
{
    public class GoNoGoDecisionDto
    {
        public int ProjectId { get; set; }
        public string BidType { get; set; }
        public string Sector { get; set; }
        public decimal TenderFee { get; set; }
        public decimal EmdAmount { get; set; }

        // Scoring and Comments
        public int MarketingPlanScore { get; set; }
        public string MarketingPlanComments { get; set; }
        public int ClientRelationshipScore { get; set; }
        public string ClientRelationshipComments { get; set; }
        public int ProjectKnowledgeScore { get; set; }
        public string ProjectKnowledgeComments { get; set; }
        public int TechnicalEligibilityScore { get; set; }
        public string TechnicalEligibilityComments { get; set; }
        public int FinancialEligibilityScore { get; set; }
        public string FinancialEligibilityComments { get; set; }
        public int StaffAvailabilityScore { get; set; }
        public string StaffAvailabilityComments { get; set; }
        public int CompetitionAssessmentScore { get; set; }
        public string CompetitionAssessmentComments { get; set; }
        public int CompetitivePositionScore { get; set; }
        public string CompetitivePositionComments { get; set; }
        public int FutureWorkPotentialScore { get; set; }
        public string FutureWorkPotentialComments { get; set; }
        public int ProfitabilityScore { get; set; }
        public string ProfitabilityComments { get; set; }
        public int ResourceAvailabilityScore { get; set; }
        public string ResourceAvailabilityComments { get; set; }
        public int BidScheduleScore { get; set; }
        public string BidScheduleComments { get; set; }

        // Total Score and Decision
        public int TotalScore { get; set; }
        public GoNoGoStatus Status { get; set; }
        public string DecisionComments { get; set; }

        // Approval Information
        public DateTime CompletedDate { get; set; }
        public string CompletedBy { get; set; }
        public DateTime? ReviewedDate { get; set; }
        public string? ReviewedBy { get; set; }
        public DateTime? ApprovedDate { get; set; }
        public string? ApprovedBy { get; set; }

        // Action Plan
        public string? ActionPlan { get; set; }

        // Audit Fields
        public DateTime CreatedAt { get; set; }
        public string CreatedBy { get; set; }
        public DateTime? LastModifiedAt { get; set; }
        public string? LastModifiedBy { get; set; }
    }
}

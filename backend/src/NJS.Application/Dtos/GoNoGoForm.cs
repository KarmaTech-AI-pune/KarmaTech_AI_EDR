﻿using NJS.Domain.Enums;

namespace NJS.Application.Dtos
{
    public class GoNoGoForm
    {
        public HeaderInfo HeaderInfo { get; set; }
        public MetaData MetaData { get; set; }
        public ScoringCriteriaDto ScoringCriteria { get; set; }
        public Summary Summary { get; set; }
    }

    public class HeaderInfo
    {
        public TypeOfBid TypeOfBid { get; set; }
        public string Sector { get; set; }
        public string BdHead { get; set; }
        public string Office { get; set; }     
        public int TenderFee { get; set; }
        public int Emd { get; set; }
    }

    public class MetaData
    {
        public int OpprotunityId { get; set; }
        public int Id { get; set; }
        
        public string CompletedDate { get; set; }
        public string CompletedBy { get; set; }
        public string CreatedBy { get; set; }
    }

    public class ScoringCriteriaDto
    {
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

    public class CriteriaItem
    {
        public string Comments { get; set; }
        public int Score { get; set; }
        public int ScoringDescriptionId { get; set; }
    }

    public class Summary
    {
        public int TotalScore { get; set; }
        public GoNoGoStatus Status { get; set; }
        public string DecisionComments { get; set; }
        public string ActionPlan { get; set; }
    }
}

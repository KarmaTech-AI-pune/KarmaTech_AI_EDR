using EDR.Domain.Enums;
using System;

namespace EDR.Application.Dtos
{
    public class OpportunityTrackingDto
    {
        public int Id { get; set; }
        public string? BidNumber { get; set; }
        public OpportunityStage Stage { get; set; }
        public string StrategicRanking { get; set; }
        public decimal? BidFees { get; set; }
        public decimal? Emd { get; set; }
        public string? FormOfEMD { get; set; }
        public string? BidManagerId { get; set; }
        public string? ReviewManagerId { get; set; }
        public string? ApprovalManagerId { get; set; }
        public string? ContactPersonAtClient { get; set; }
        public DateTime? DateOfSubmission { get; set; }
        public decimal? PercentageChanceOfProjectHappening { get; set; }
        public decimal? PercentageChanceOfEDRSuccess { get; set; }
        public string? LikelyCompetition { get; set; }
        public decimal? GrossRevenue { get; set; }
        public decimal? NetEDRRevenue { get; set; }
        public string? FollowUpComments { get; set; }
        public string? Notes { get; set; }
        public string? ProbableQualifyingCriteria { get; set; }
        public string Operation { get; set; }
        public string WorkName { get; set; }
        public string Client { get; set; }
        public string ClientSector { get; set; }
        public DateTime LikelyStartDate { get; set; }
        public OpportunityTrackingStatus Status { get; set; }
        public string Currency { get; set; }
        public decimal CapitalValue { get; set; }
        public int DurationOfProject { get; set; }
        public string FundingStream { get; set; }
        public string ContractType { get; set; }       
        public OpportunityHistoryDto CurrentHistory { get; set; }
    }
}



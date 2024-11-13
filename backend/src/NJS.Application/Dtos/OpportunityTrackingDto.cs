using System;

namespace NJS.Application.Dtos
{
    public class ProjectInfoDto
    {
        public int Id { get; set; }
        public string? Name { get; set; }
    }

    public class OpportunityTrackingDto
    {
        public int Id { get; set; }
        public int? ProjectId { get; set; }
        public ProjectInfoDto? Project { get; set; }
        public string? Stage { get; set; }
        public string? StrategicRanking { get; set; }
        public decimal? BidFees { get; set; }
        public decimal? EMD { get; set; }
        public string? FormOfEMD { get; set; }
        public string? BidManager { get; set; }
        public string? ContactPersonAtClient { get; set; }
        public DateTime? DateOfSubmission { get; set; }
        public decimal? PercentageChanceOfProjectHappening { get; set; }
        public decimal? PercentageChanceOfNJSSuccess { get; set; }
        public string? LikelyCompetition { get; set; }
        public DateTime? DateOfResult { get; set; }
        public decimal? GrossRevenue { get; set; }
        public decimal? NetNJSRevenue { get; set; }
        public string? FollowUpComments { get; set; }
        public string? Notes { get; set; }
        public string? ProbableQualifyingCriteria { get; set; }
        public int Month { get; set; }
        public int Year { get; set; }
        public string? TrackedBy { get; set; }
        public DateTime CreatedAt { get; set; }
        public string? CreatedBy { get; set; }
        public DateTime? LastModifiedAt { get; set; }
        public string? LastModifiedBy { get; set; }
    }
}

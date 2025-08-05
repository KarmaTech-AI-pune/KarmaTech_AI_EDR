using System;
using System.Diagnostics.Metrics;
using NJS.Domain.Entities;

namespace NJS.Application.Dtos
{
    public class ProjectDto
    {
        public int Id { get; set; }
        public int? TenantId { get; set; } // Added for multi-tenant support
        public string Name { get; set; }
        public string ClientName { get; set; }
		public int ProjectNo { get; set; }
		public string? TypeOfClient { get; set; }
		public string ProjectManagerId { get; set; }
		public string? SeniorProjectManagerId { get; set; }
		public string RegionalManagerId { get; set; }
		public string Office { get; set; } = string.Empty;
		public string Region { get; set; } = string.Empty;
		public string TypeOfJob { get; set; } = string.Empty;
		public string Sector { get; set; }
        public string FeeType { get; set; } = string.Empty;
        public decimal EstimatedProjectCost { get; set; }
        public decimal EstimatedProjectFee {  get; set; }
        public decimal? Percentage { get; set; }
        public string? Details { get; set; }
		public string Priority { get; set; } = string.Empty;
		public string Currency { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
		public decimal? CapitalValue { get; set; }
		public ProjectStatus Status { get; set; }
        public int Progress { get; set; }
        public int? DurationInMonths { get; set; }
        public string? FundingStream { get; set; }
        public string? ContractType { get; set; }
        public bool LetterOfAcceptance { get; set; }
        public int OpportunityTrackingId { get; set; }
        public DateTime CreatedAt { get; set; }
        public string? CreatedBy { get; set; }
        public DateTime? LastModifiedAt { get; set; }
        public string? LastModifiedBy { get; set; }
    }
}

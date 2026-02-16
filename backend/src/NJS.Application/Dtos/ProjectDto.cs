using System;
using System.ComponentModel.DataAnnotations;
using System.Diagnostics.Metrics;
using NJS.Domain.Entities;

namespace NJS.Application.Dtos
{
    public class ProjectDto
    {
        public int Id { get; set; }
        public int? TenantId { get; set; } // Added for multi-tenant support
        
        [Required(ErrorMessage = "Project name is required")]
        [StringLength(100, ErrorMessage = "Project name cannot exceed 100 characters")]
        public string? Name { get; set; }
        
        [Required(ErrorMessage = "Client name is required")]
        [StringLength(100, ErrorMessage = "Client name cannot exceed 100 characters")]
        public string? ClientName { get; set; }
		public int? ProjectNo { get; set; }
		public string? TypeOfClient { get; set; }
		public string? ProjectManagerId { get; set; }
		public string? SeniorProjectManagerId { get; set; }
		public string? RegionalManagerId { get; set; }
		public string? Office { get; set; }
        public string? Region { get; set; }
        public string? TypeOfJob { get; set; }
        [Required(ErrorMessage = "Sector is required")]
        [StringLength(50, ErrorMessage = "Sector cannot exceed 50 characters")]
        public string? Sector { get; set; }
        public string? FeeType { get; set; }
        public decimal? EstimatedProjectCost { get; set; }
        public decimal? EstimatedProjectFee {  get; set; }
        public decimal? Percentage { get; set; }
        public string? Details { get; set; }
		public string? Priority { get; set; }
        [Required(ErrorMessage = "Currency is required")]
        [StringLength(3, ErrorMessage = "Currency code cannot exceed 3 characters")]
        public string? Currency { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
		public decimal? CapitalValue { get; set; }
		public ProjectStatus Status { get; set; }
        public int Progress { get; set; }
        public int? DurationInMonths { get; set; }
        [Required(ErrorMessage = "Funding stream is required")]
        public string? FundingStream { get; set; }
        
        [Required(ErrorMessage = "Contract type is required")]
        public string? ContractType { get; set; }
        public bool? LetterOfAcceptance { get; set; }
        public int? OpportunityTrackingId { get; set; }
        
        [Required(ErrorMessage = "ProgramId is required. A project must belong to a program.")]
        [Range(1, int.MaxValue, ErrorMessage = "ProgramId must be greater than 0.")]
        public int ProgramId { get; set; }
        
        public DateTime CreatedAt { get; set; }
        public string? CreatedBy { get; set; }
        public DateTime? LastModifiedAt { get; set; }
        public string? LastModifiedBy { get; set; }
        public string? BudgetReason { get; set; } // Optional reason for budget changes
    }
}

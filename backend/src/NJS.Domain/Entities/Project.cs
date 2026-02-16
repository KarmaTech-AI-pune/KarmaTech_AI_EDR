using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using NJS.Domain.Enums;

namespace NJS.Domain.Entities
{
    public class Project : ITenantEntity
    {
        [Key]
        public int Id { get; set; }

        public int TenantId { get; set; }

        [Required]
        [StringLength(100)]
        public string? Name { get; set; }

        [Required]
        [StringLength(100)]
        public string? ClientName { get; set; }

        public int? ProjectNo { get; set; }

        [StringLength(50)]
        public string? TypeOfClient { get; set; }

        public string? ProjectManagerId { get; set; }
        [ForeignKey("ProjectManagerId")]
        public User? ProjectManager { get; set; }

        public string? SeniorProjectManagerId { get; set; }
        [ForeignKey("SeniorProjectManagerId")]
        public User? SeniorProjectManager { get; set; }

        public string? RegionalManagerId { get; set; }
        [ForeignKey("RegionalManagerId")]
        public User? RegionalManager { get; set; }

        public string? Office { get; set; }

        public string? Region { get; set; }

        public string? TypeOfJob { get; set; }

        [Required]
        [StringLength(50)]
        public string? Sector { get; set; }

        public string? FeeType { get; set; }

        public decimal? EstimatedProjectCost { get; set; }

        public decimal? EstimatedProjectFee { get; set; }

        public decimal? Percentage { get; set; }

        public string? Details { get; set; }

        public string? Priority { get; set; }

        [Required]
        [StringLength(3)]
        public string? Currency { get; set; }

        public DateTime? StartDate { get; set; }

        public DateTime? EndDate { get; set; }

        public decimal? CapitalValue { get; set; }

        public ProjectStatus Status { get; set; }

        public int Progress { get; set; }

        public int? DurationInMonths { get; set; }

        public string? FundingStream { get; set; }

        public string? ContractType { get; set; }

        public bool? LetterOfAcceptance { get; set; }

        public int? OpportunityTrackingId { get; set; }

        public int ProgramId { get; set; }
        [ForeignKey("ProgramId")]
        public virtual Program Program { get; set; }

        public DateTime CreatedAt { get; set; }

        [Required]
        [StringLength(100)]
        public string? CreatedBy { get; set; }

        public DateTime? LastModifiedAt { get; set; }

        public string? LastModifiedBy { get; set; }

        public virtual ICollection<SprintWbsPlan> SprintWbsPlans { get; set; }
    }
}

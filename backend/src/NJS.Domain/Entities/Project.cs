using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NJS.Domain.Entities
{
    [Table("Projects")]
    public class Project : IAuditableEntity
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(100)]
        public string? Name { get; set; }

        [Required]
        [StringLength(100)]
        public string? ClientName { get; set; }

        [Required]
        [StringLength(50)]
        public string? TypeOfClient { get; set; }

        [Required]
        [StringLength(50)]
        public string? Sector { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal EstimatedCost { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal? CapitalValue { get; set; }

        public DateTime? StartDate { get; set; }

        public DateTime? EndDate { get; set; }

        [Required]
        public ProjectStatus Status { get; set; }

        public int Progress { get; set; }

        public int? DurationInMonths { get; set; }

        [StringLength(100)]
        public string? FundingStream { get; set; }

        
        [StringLength(50)]
        public string? ContractType { get; set; }

        [Required]
        [StringLength(3)]
        public string? Currency { get; set; }

        [ForeignKey("ProjectManager")]
        public string? ProjectManagerId { get; set; }
        public virtual User ProjectManager { get; set; }

        [ForeignKey("RegionalManager")]
        public string? RegionalManagerId { get; set; }
        public virtual User RegionalManager { get; set; }

        [ForeignKey("SeniorProjectManager")]
        public string? SeniorProjectManagerId { get; set; }
        public virtual User SeniorProjectManager { get; set; }

        [ForeignKey("OpportunityTrackingId")]
        public int? OpportunityTrackingId { get; set; }
        public virtual OpportunityTracking OpportunityTracking { get; set; }

        public virtual ICollection<ProjectResource> ProjectResources { get; set; }

        [Required]
        public DateTime CreatedAt { get; set; }

        [Required]
        [StringLength(100)]
        public string? CreatedBy { get; set; }

        public DateTime? LastModifiedAt { get; set; }

        [StringLength(100)]
        public string? LastModifiedBy { get; set; }
        public DateTime UpdatedAt { get; set; }
        public string? UpdatedBy { get; set; }
        public bool IsDeleted { get; set; } = false;
        public bool LetterOfAcceptance { get; set; }

        public void SoftDelete(string user)
        {
            IsDeleted = true;
            UpdatedBy = user;
            UpdatedAt = DateTime.Now;
        }

        public Project()
        {

            ProjectResources = [];
            var dateTime = DateTime.Now;
            UpdatedAt = dateTime;
            CreatedAt = dateTime;

        }
    }

    public enum ProjectStatus
    {
        Opportunity,
        DecisionPending,
        Cancelled,
        BidSubmitted,
        BidRejected,
        BidAccepted,
        InProgress,
        Completed
    }
}

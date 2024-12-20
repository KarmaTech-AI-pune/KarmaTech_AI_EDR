using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NJS.Domain.Entities
{
    [Table("Projects")]
    public class Project
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
        public string? ClientSector { get; set; }

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

        [Required]
        [StringLength(50)]
        public string? ContractType { get; set; }

        [Required]
        [StringLength(3)]
        public string? Currency { get; set; }

        // Project Manager relationship
        [ForeignKey("ProjectManager")]
        public string? ProjectManagerId { get; set; }
        public virtual User ProjectManager { get; set; }

        // Regional Manager relationship
        [ForeignKey("RegionalManager")]
        public string? RegionalManagerId { get; set; }
        public virtual User RegionalManager { get; set; }

        // Senior Project Manager relationship
        [ForeignKey("SeniorProjectManager")]
        public string? SeniorProjectManagerId { get; set; }
        public virtual User SeniorProjectManager { get; set; }   

      
        // Navigation property for ProjectResources
        public virtual ICollection<ProjectResource> ProjectResources { get; set; }

        // Audit Fields
        [Required]
        public DateTime CreatedAt { get; set; }

        [Required]
        [StringLength(100)]
        public string? CreatedBy { get; set; }

        public DateTime? LastModifiedAt { get; set; }

        [StringLength(100)]
        public string? LastModifiedBy { get; set; }

        public Project()
        {
           
            ProjectResources = new List<ProjectResource>();
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

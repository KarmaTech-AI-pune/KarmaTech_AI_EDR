using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace EDR.Domain.Entities
{
    public class ChangeControl : ITenantEntity
    {
        [Key]
        public int Id { get; set; }

        public int TenantId { get; set; }

        [Required]
        public int ProjectId { get; set; }

        [Required]
        public int SrNo { get; set; }

        [Required]
        public DateTime DateLogged { get; set; }

        [StringLength(100)]
        public string? Originator { get; set; }

        [StringLength(500)]
        public string? Description { get; set; }

        [StringLength(255)]
        public string CostImpact { get; set; }

        [StringLength(255)]
        public string TimeImpact { get; set; }

        [StringLength(255)]
        public string ResourcesImpact { get; set; }

        [StringLength(255)]
        public string QualityImpact { get; set; }

        [StringLength(100)]
        public string ChangeOrderStatus { get; set; }

        [StringLength(100)]
        public string ClientApprovalStatus { get; set; }

        [StringLength(255)]
        public string ClaimSituation { get; set; }

        // Navigation property
        [ForeignKey("ProjectId")]
        [DeleteBehavior(DeleteBehavior.NoAction)]
        public virtual Project Project { get; set; }

        // Workflow status
        public int WorkflowStatusId { get; set; } = 1; // Default to Initial

        [ForeignKey("WorkflowStatusId")]
        [DeleteBehavior(DeleteBehavior.NoAction)]
        public virtual PMWorkflowStatus WorkflowStatus { get; set; }

        // Navigation property for workflow history
        public ICollection<ChangeControlWorkflowHistory> WorkflowHistories { get; set; } = new List<ChangeControlWorkflowHistory>();

        // Audit fields
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; } = DateTime.UtcNow;
        [StringLength(100)]
        public string CreatedBy { get; set; } = "System";
        [StringLength(100)]
        public string UpdatedBy { get; set; } = "System";
    }
}


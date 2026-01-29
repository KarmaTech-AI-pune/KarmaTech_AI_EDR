using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NJS.Domain.Entities
{
    public class ProjectBudgetChangeHistory : IAuditableEntity, ITenantEntity
    {
        [Key]
        public int Id { get; set; }

        public int TenantId { get; set; }

        [Required]
        public int ProjectId { get; set; }

        [Required]
        [MaxLength(50)]
        public string FieldName { get; set; } // "EstimatedProjectCost" or "EstimatedProjectFee"

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal OldValue { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal NewValue { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal Variance { get; set; } // NewValue - OldValue

        [Required]
        [Column(TypeName = "decimal(10,4)")]
        public decimal PercentageVariance { get; set; } // (Variance / OldValue) * 100

        [Required]
        [MaxLength(10)]
        public string Currency { get; set; }

        [Required]
        [MaxLength(450)]
        public string ChangedBy { get; set; }

        [Required]
        public DateTime ChangedDate { get; set; } = DateTime.UtcNow;

        [MaxLength(500)]
        public string? Reason { get; set; }

        // IAuditableEntity properties
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; }
        public string CreatedBy { get; set; }
        public string UpdatedBy { get; set; }

        // Navigation Properties
        [ForeignKey("ProjectId")]
        public virtual Project Project { get; set; }

        [ForeignKey("ChangedBy")]
        public virtual User ChangedByUser { get; set; }
    }
}
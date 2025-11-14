using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using NJS.Domain.Entities; // For IAuditableEntity
using NJS.Domain.GenericRepository; // For ITenantEntity

namespace NJS.Domain.Entities
{
    public class SprintDailyProgress : IAuditableEntity, ITenantEntity
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int DailyProgressId { get; set; }

        public int TenantId { get; set; }

        public int SprintPlanId { get; set; } // Foreign Key to SprintPlan

        public DateTime Date { get; set; }

        public int PlannedStoryPoints { get; set; }

        public int CompletedStoryPoints { get; set; }

        public int RemainingStoryPoints { get; set; }

        public int AddedStoryPoints { get; set; }

        public int IdealRemainingPoints { get; set; }

        // Navigation property for SprintPlan
        [ForeignKey("SprintPlanId")]
        public virtual SprintPlan SprintPlan { get; set; }

        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; } // Changed to non-nullable
        public string CreatedBy { get; set; }
        public string UpdatedBy { get; set; } // Changed to non-nullable
    }
}

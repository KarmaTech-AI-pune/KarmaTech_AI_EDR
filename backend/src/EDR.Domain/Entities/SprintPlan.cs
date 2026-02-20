using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using EDR.Domain.GenericRepository; // Added for ITenantEntity

namespace EDR.Domain.Entities
{
    public class SprintPlan : ITenantEntity
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]

        public int SprintId { get; set; }

        public int TenantId { get; set; } // Added TenantId

        public int? SprintNumber { get; set; }

        public DateTime? StartDate { get; set; }

        public DateTime? EndDate { get; set; }

        [StringLength(500)]
        public string? SprintGoal { get; set; }

        [ForeignKey("Project")]
        public int? ProjectId { get; set; }
        public Project Project { get; set; }
        public int RequiredSprintEmployees { get; set; } // Number of employees required for this sprint

        [StringLength(200)]
        public string? SprintName { get; set; }
        public int PlannedStoryPoints { get; set; } = 0;
        public int ActualStoryPoints { get; set; } = 0;
        [Column(TypeName = "decimal(5, 2)")]
        public decimal Velocity { get; set; } = 0.00m;
        public int Status { get; set; } = 0; // Assuming 0 is a default/initial status
        public DateTime? StartedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow; // Default to UTC now
        public DateTime? UpdatedAt { get; set; }

        public ICollection<SprintTask> SprintTasks { get; set; } = new List<SprintTask>();
        public ICollection<SprintDailyProgress> SprintDailyProgresses { get; set; } = new List<SprintDailyProgress>();
    }
}


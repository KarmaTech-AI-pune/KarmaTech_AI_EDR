using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using NJS.Domain.GenericRepository; // Added for ITenantEntity

namespace NJS.Domain.Entities
{
    public class SprintPlan : ITenantEntity
    {
        [Key]
        public int SprintId { get; set; }

        public int TenantId { get; set; } // Added TenantId

        public int? SprintNumber { get; set; }

        public DateTime? StartDate { get; set; }

        public DateTime? EndDate { get; set; }

        [StringLength(500)]
        public string? SprintGoal { get; set; }

        [ForeignKey("Project")]
        public int ProjectId { get; set; }
        public Project Project { get; set; }
        public int? SprintEmployee { get; set; } // New column for SprintEmployee

        public ICollection<SprintTask> SprintTasks { get; set; } = new List<SprintTask>();
    }
}

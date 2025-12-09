using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using NJS.Domain.Enums;

namespace NJS.Domain.Entities
{
    /// <summary>
    /// Entity to track WBS task versions within a WBS version
    /// </summary>
    public class WBSTaskVersionHistory : ITenantEntity
    {
        public WBSTaskVersionHistory()
        {
            PlannedHours = new List<WBSTaskPlannedHourVersionHistory>();
            UserAssignments = new List<UserWBSTaskVersionHistory>();
        }

        [Key]
        public int Id { get; set; }

        public int TenantId { get; set; }

        [Required]
        public int WBSVersionHistoryId { get; set; }

        [Required]
        public int OriginalTaskId { get; set; } // Reference to original WBSTask

        [Required]
        public WBSTaskLevel Level { get; set; }

        [Required]
        [StringLength(255)]
        public string Title { get; set; }

        [StringLength(1000)]
        public string Description { get; set; }

        public int DisplayOrder { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal EstimatedBudget { get; set; }

        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }

        public TaskType TaskType { get; set; } = TaskType.Manpower;

        // Navigation properties
        [ForeignKey("WBSVersionHistoryId")]
        public WBSVersionHistory WBSVersionHistory { get; set; }

        public ICollection<WBSTaskPlannedHourVersionHistory> PlannedHours { get; set; }
        public ICollection<UserWBSTaskVersionHistory> UserAssignments { get; set; }
    }
}

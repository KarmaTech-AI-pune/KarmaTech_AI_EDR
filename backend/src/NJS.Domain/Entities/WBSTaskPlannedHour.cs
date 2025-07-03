using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NJS.Domain.Entities
{
    public class WBSTaskPlannedHour
    {
        [Key]
        public int Id { get; set; }
        public int WBSTaskPlannedHourHeaderId { get; set; }
        public WBSTaskPlannedHourHeader WBSTaskPlannedHourHeader { get; set; }

        [Required]
        public int WBSTaskId { get; set; }

        [Required]
        [StringLength(4)]
        public string Year { get; set; }

        [Required]
        public int Month { get; set; } // Changed from string to int (1-12)

        public DateTime? Date { get; set; } // Full date for daily planning
        public int? WeekNumber { get; set; } // Week number (1-53) for weekly planning

        public double PlannedHours { get; set; }

        public double? ActualHours { get; set; }

        public DateTime CreatedAt { get; set; }

        [StringLength(100)]
        public string CreatedBy { get; set; }

        public DateTime? UpdatedAt { get; set; }

        [StringLength(100)]
        public string UpdatedBy { get; set; }

        // Navigation property
        [ForeignKey(nameof(WBSTaskId))]
        public WBSTask WBSTask { get; set; }
    }
}

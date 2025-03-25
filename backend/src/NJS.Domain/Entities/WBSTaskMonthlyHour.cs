using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NJS.Domain.Entities
{
    public class WBSTaskMonthlyHour
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int WBSTaskId { get; set; }

        [Required]
        [StringLength(4)]
        public string Year { get; set; }

        [Required]
        [StringLength(20)]
        public string Month { get; set; }

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

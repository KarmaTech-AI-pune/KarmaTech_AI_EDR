using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EDR.Domain.Entities
{
    /// <summary>
    /// Entity to track planned hours for WBS task versions
    /// </summary>
    public class WBSTaskPlannedHourVersionHistory : ITenantEntity
    {
        [Key]
        public int Id { get; set; }

        public int TenantId { get; set; }

        [Required]
        public int WBSTaskVersionHistoryId { get; set; }

        [Required]
        [StringLength(4)]
        public string Year { get; set; }

        [Required]
        [StringLength(20)]
        public string Month { get; set; }

        public double PlannedHours { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [StringLength(100)]
        public string CreatedBy { get; set; }

        // Navigation properties
        [ForeignKey("WBSTaskVersionHistoryId")]
        public WBSTaskVersionHistory WBSTaskVersionHistory { get; set; }
    }
}


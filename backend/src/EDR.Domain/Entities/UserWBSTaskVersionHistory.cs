using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EDR.Domain.Entities
{
    /// <summary>
    /// Entity to track user assignments for WBS task versions
    /// </summary>
    public class UserWBSTaskVersionHistory : ITenantEntity
    {
        [Key]
        public int Id { get; set; }

        public int TenantId { get; set; }

        [Required]
        public int WBSTaskVersionHistoryId { get; set; }

        [StringLength(450)]
        public string? UserId { get; set; }

        public string? Name { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal CostRate { get; set; }

        public string? Unit { get; set; }

        public double TotalHours { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalCost { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [StringLength(100)]
        public string CreatedBy { get; set; }

        public string? ResourceRoleId { get; set; }

        // Navigation properties
        [ForeignKey("WBSTaskVersionHistoryId")]
        public WBSTaskVersionHistory WBSTaskVersionHistory { get; set; }

        [ForeignKey("UserId")]
        public User User { get; set; }

        [ForeignKey("ResourceRoleId")]
        public Role ResourceRole { get; set; }
    }
}


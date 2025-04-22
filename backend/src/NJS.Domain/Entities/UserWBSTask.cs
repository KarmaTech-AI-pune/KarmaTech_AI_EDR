using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NJS.Domain.Entities
{
    public class UserWBSTask
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(450)]
        public string UserId { get; set; }

        [Required]
        public int WBSTaskId { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal CostRate { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal ODCCost { get; set; }
        public double TotalHours { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalCost { get; set; }

        public double ODCHours { get; set; }

        public DateTime CreatedAt { get; set; }

        [StringLength(100)]
        public string CreatedBy { get; set; }

        public DateTime? UpdatedAt { get; set; }

        [StringLength(100)]
        public string UpdatedBy { get; set; }

        // Navigation properties
        [ForeignKey(nameof(UserId))]
        public User User { get; set; }

        [ForeignKey(nameof(WBSTaskId))]
        public WBSTask WBSTask { get; set; }
    }
}

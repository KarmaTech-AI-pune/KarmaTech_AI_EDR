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
        public int WBSTaskId { get; set; }

        [StringLength(450)]
        public string? UserId { get; set; }


        public string? Name { get; set; }


        [Column(TypeName = "decimal(18,2)")]
        public decimal CostRate { get; set; }

        public string? Unit { get; set; }

        public double TotalHours { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalCost { get; set; }

        public DateTime CreatedAt { get; set; }

        [StringLength(100)]
        public string CreatedBy { get; set; }

        public DateTime? UpdatedAt { get; set; }

        [StringLength(100)]
        public string UpdatedBy { get; set; }

        public string? ResourceRoleId { get; set; }

        // Navigation properties
        [ForeignKey("WBSTaskId")]
        public virtual WBSTask WBSTask { get; set; }

        [ForeignKey("UserId")]
        public virtual User User { get; set; }

        [ForeignKey("ResourceRoleId")]
        public virtual Role ResourceRole { get; set; }
    }
}

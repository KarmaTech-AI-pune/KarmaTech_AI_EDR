using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NJS.Domain.Entities
{
    public class UserWBSTask
    {
        [Key]
        public int Id { get; set; }

        public string UserId { get; set; }
        public User User { get; set; }

        public int WBSTaskId { get; set; }
        public WBSTask WBSTask { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal CostRate { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal ODC { get; set; }

        public double TotalHours { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalCost { get; set; }

        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}

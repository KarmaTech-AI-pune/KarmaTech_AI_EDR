using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NJS.Domain.Entities
{
    public class Cashflow
    {
        [Key]
        public int Id { get; set; }


        [ForeignKey("Project")]
      
        public int? ProjectId { get; set; }
        public string? Month { get; set; }

        public int? TotalHours { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal? PersonnelCost { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal? OdcCost { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal? TotalProjectCost { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal? CumulativeCost { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal? Revenue { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal? CumulativeRevenue { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal? CashFlow { get; set; }

     
    }
}

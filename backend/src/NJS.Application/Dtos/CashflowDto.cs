using System;

namespace NJS.Application.DTOs
{
    public class CashflowDto
    {
        public int? Id { get; set; }
        public int? ProjectId { get; set; }
        public string? Month { get; set; }
        public decimal? PersonnelCost { get; set; }
        public decimal? OdcCost { get; set; }
        public decimal? TotalProjectCost { get; set; }
        public decimal? CumulativeCost { get; set; }
        public decimal? Revenue { get; set; }
        public decimal? CashFlow { get; set; }
        public string? Status { get; set; }
       
    }
}

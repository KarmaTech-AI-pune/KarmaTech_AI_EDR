using System;

namespace NJS.Application.DTOs
{
    public class CumulativeCashflowDto
    {
        public string Period { get; set; }
        public decimal CumulativeCosts { get; set; }
        public decimal CumulativeRevenue { get; set; }
        public decimal NetPosition { get; set; }
        public string CashPosition { get; set; }
    }
}

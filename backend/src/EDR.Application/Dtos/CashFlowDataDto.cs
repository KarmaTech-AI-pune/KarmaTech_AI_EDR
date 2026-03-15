using System.Collections.Generic;

namespace EDR.Application.DTOs
{
    public class CashFlowDataDto
    {
        public string ProjectId { get; set; }
        public List<CashFlowRowDto> Rows { get; set; }
    }

    public class CashFlowRowDto
    {
        public string Period { get; set; }
        public int Hours { get; set; }
        public decimal Personnel { get; set; }
        public decimal Odc { get; set; }
        public decimal TotalCosts { get; set; }
        public decimal Revenue { get; set; }
        public decimal NetCashFlow { get; set; }
        public string Status { get; set; }
    }
}

using System;

namespace NJS.Application.DTOs
{
    public class FinancialSummaryDto
    {
        public decimal TotalProjectValue { get; set; }
        public decimal AmountInvoiced { get; set; }
        public decimal AmountSpent { get; set; }
        public decimal CurrentCashPosition { get; set; }
    }
}

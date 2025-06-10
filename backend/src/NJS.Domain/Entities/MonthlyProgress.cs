using System;
using System.Collections.Generic;

namespace NJS.Domain.Entities
{
    public class MonthlyProgress
    {
        public int Id { get; set; }
        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

        // Navigation properties for related entities
        public FinancialDetails FinancialDetails { get; set; }
        public ContractAndCost ContractAndCost { get; set; }
        public CTCEAC CTCEAC { get; set; }
        public Schedule Schedule { get; set; }
        public ManpowerPlanning ManpowerPlanning { get; set; }
        public ProgressDeliverable ProgressDeliverable { get; set; }
        public ChangeOrder ChangeOrder { get; set; }
        public LastMonthAction LastMonthAction { get; set; }
        public CurrentMonthAction CurrentMonthAction { get; set; }
    }
}

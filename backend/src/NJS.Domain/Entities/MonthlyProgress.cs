using System;
using System.Collections.Generic;

namespace NJS.Domain.Entities
{
    public class MonthlyProgress : ITenantEntity
    {
        public int Id { get; set; }
        public int TenantId { get; set; }
        public int ProjectId { get; set; }
        public Project Project { get; set; }
        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
        public int Month { get; set; } // Month of the monthly progress (1-12)
        public int Year { get; set; } // Year of the monthly progress

        // Navigation properties for related entities
        public FinancialDetails FinancialDetails { get; set; }
        public ContractAndCost ContractAndCost { get; set; }
        public CTCEAC CTCEAC { get; set; }
        public Schedule Schedule { get; set; }
        public ICollection<ManpowerPlanning> ManpowerEntries { get; set; }
        public decimal ManpowerTotal { get; set; } // Added based on latest feedback
        public ICollection<ProgressDeliverable> ProgressDeliverables { get; set; }
        public ICollection<ChangeOrder> ChangeOrders { get; set; }
        public ICollection<LastMonthAction> LastMonthActions { get; set; }
        public ICollection<CurrentMonthAction> CurrentMonthActions { get; set; }
        public ICollection<ProgrammeSchedule> ProgrammeSchedules { get; set; }
        public ICollection<EarlyWarning> EarlyWarnings { get; set; }
        public BudgetTable BudgetTable { get; set; }
    }
}

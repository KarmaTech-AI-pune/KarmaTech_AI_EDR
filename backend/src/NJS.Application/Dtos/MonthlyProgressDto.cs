using System.Collections.Generic;

namespace NJS.Application.DTOs
{
    public class MonthlyProgressDto
    {
        public FinancialDetailsDto? FinancialDetails { get; set; }
        public ContractAndCostDto? ContractAndCost { get; set; }
        public CTCEACDto? CTCEAC { get; set; }
        public ScheduleDto? Schedule { get; set; }
        public ICollection<ManpowerPlanningDto>? ManpowerEntries { get; set; }
        public decimal ManpowerTotal { get; set; } // Added based on latest feedback
        public ICollection<ProgressDeliverableDto>? ProgressDeliverables { get; set; }
        public ICollection<ChangeOrderDto>? ChangeOrders { get; set; }
        public ICollection<LastMonthActionDto>? LastMonthActions { get; set; }
        public ICollection<CurrentMonthActionDto>? CurrentMonthActions { get; set; }
        public BudgetTableDto? BudgetTable { get; set; }
    }
}

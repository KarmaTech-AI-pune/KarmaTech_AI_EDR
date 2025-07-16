using System.Collections.Generic;

namespace NJS.Application.DTOs
{
    public class MonthlyProgressDto
    {
        public int Id { get; set; }
        public int ProjectId { get; set; }
        public int Month { get; set; } // Month of the monthly progress (1-12)
        public int Year { get; set; } // Year of the monthly progress
        public FinancialDetailsDto? FinancialAndContractDetails { get; set; }
        public ContractAndCostDto? ActualCost { get; set; }
        public CTCEACDto? CtcAndEac { get; set; }
        public ScheduleDto? Schedule { get; set; }
        public BudgetTableDto? BudgetTable { get; set; }
        public ManpowerPlanningDto? ManpowerPlanning { get; set; }
        public ProgressDeliverableWrapperDto? ProgressDeliverable { get; set; }
        public ICollection<ChangeOrderDto>? ChangeOrder { get; set; }
        public ICollection<ProgrammeScheduleDto>? ProgrammeSchedule { get; set; }
        public ICollection<EarlyWarningDto>? EarlyWarnings { get; set; }
        public ICollection<LastMonthActionDto>? LastMonthActions { get; set; }
        public ICollection<CurrentMonthActionDto>? CurrentMonthActions { get; set; }
    }

    // DTO for creating monthly progress that matches frontend payload structure
    public class CreateMonthlyProgressDto
    {
        public int Month { get; set; } // Month of the monthly progress (1-12)
        public int Year { get; set; } // Year of the monthly progress
        public FinancialDetailsDto? FinancialAndContractDetails { get; set; }
        public ContractAndCostDto? ActualCost { get; set; }
        public CTCEACDto? CtcAndEac { get; set; }
        public ScheduleDto? Schedule { get; set; }
        public BudgetTableDto? BudgetTable { get; set; }
        public ManpowerPlanningDto? ManpowerPlanning { get; set; }
        public ProgressDeliverableWrapperDto? ProgressDeliverable { get; set; }
        public ICollection<ChangeOrderDto>? ChangeOrder { get; set; }
        public ICollection<ProgrammeScheduleDto>? ProgrammeSchedule { get; set; }
        public ICollection<EarlyWarningDto>? EarlyWarnings { get; set; }
        public ICollection<LastMonthActionDto>? LastMonthActions { get; set; }
        public ICollection<CurrentMonthActionDto>? CurrentMonthActions { get; set; }
    }
}

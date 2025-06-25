using System.Collections.Generic;

namespace NJS.Application.DTOs
{
    public class MonthlyProgressDto
    {
        public int Id { get; set; }
        public int ProjectId { get; set; }
        public FinancialDetailsDto? FinancialDetails { get; set; }
        public ContractAndCostDto? ContractAndCost { get; set; }
        public CTCEACDto? CtcAndEac { get; set; }
        public ScheduleDto? Schedule { get; set; }
        public BudgetTableDto? BudgetTable { get; set; }
        public ManpowerPlanningDto? ManpowerPlanning { get; set; }
        public ICollection<ProgressDeliverableDto>? ProgressDeliverable { get; set; }
        public ICollection<ChangeOrderDto>? ChangeOrder { get; set; }
        public ICollection<ProgrammeScheduleDto>? ProgrammeSchedule { get; set; }
        public ICollection<EarlyWarningDto>? EarlyWarnings { get; set; }
        public ICollection<LastMonthActionDto>? LastMonthActions { get; set; }
        public ICollection<CurrentMonthActionDto>? CurrentMonthActions { get; set; }
    }

    // DTO for creating monthly progress that matches frontend payload structure
    public class CreateMonthlyProgressDto
    {
        public FinancialDetailsDto? FinancialDetails { get; set; }
        public ContractAndCostDto? ContractAndCost { get; set; }
        public CTCEACDto? CtcAndEac { get; set; }
        public ScheduleDto? Schedule { get; set; }
        public BudgetTableDto? BudgetTable { get; set; }
        public ManpowerPlanningDto? ManpowerPlanning { get; set; }
        public ICollection<ProgressDeliverableDto>? ProgressDeliverable { get; set; }
        public ICollection<ChangeOrderDto>? ChangeOrder { get; set; }
        public ICollection<ProgrammeScheduleDto>? ProgrammeSchedule { get; set; }
        public ICollection<EarlyWarningDto>? EarlyWarnings { get; set; }
        public ICollection<LastMonthActionDto>? LastMonthActions { get; set; }
        public ICollection<CurrentMonthActionDto>? CurrentMonthActions { get; set; }
    }
}

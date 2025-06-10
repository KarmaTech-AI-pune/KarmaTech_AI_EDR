namespace NJS.Application.DTOs
{
    public class MonthlyProgressDto
    {
        public FinancialDetailsDto FinancialDetails { get; set; }
        public ContractAndCostDto ContractAndCost { get; set; }
        public CTCEACDto CTCEAC { get; set; }
        public ScheduleDto Schedule { get; set; }
        public ManpowerPlanningDto ManpowerPlanning { get; set; }
        public ProgressDeliverableDto ProgressDeliverable { get; set; }
        public ChangeOrderDto ChangeOrder { get; set; }
        public LastMonthActionDto LastMonthAction { get; set; }
        public CurrentMonthActionDto CurrentMonthAction { get; set; }
    }
}

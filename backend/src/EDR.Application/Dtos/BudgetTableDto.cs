namespace EDR.Application.DTOs
{
    public class BudgetTableDto
    {
        public OriginalBudgetDto? OriginalBudget { get; set; }
        public CurrentBudgetInMISDto? CurrentBudgetInMIS { get; set; }
        public PercentCompleteOnCostsDto? PercentCompleteOnCosts { get; set; }
    }
}


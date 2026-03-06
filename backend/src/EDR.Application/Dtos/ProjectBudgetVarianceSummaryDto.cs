namespace EDR.Application.Dtos
{
    public class ProjectBudgetVarianceSummaryDto
    {
        public int ProjectId { get; set; }
        public int TotalChanges { get; set; }
        public BudgetFieldVarianceDto CostChanges { get; set; } = new();
        public BudgetFieldVarianceDto FeeChanges { get; set; } = new();
        public ProjectBudgetChangeHistoryDto? MostRecentChange { get; set; }
    }

    public class BudgetFieldVarianceDto
    {
        public int Count { get; set; }
        public decimal TotalVariance { get; set; }
        public decimal AverageVariance { get; set; }
        public ProjectBudgetChangeHistoryDto? LastChange { get; set; }
    }
}

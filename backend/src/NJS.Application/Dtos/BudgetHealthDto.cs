namespace NJS.Application.DTOs
{
    public class BudgetHealthDto
    {
        public int ProjectId { get; set; }
        public string Status { get; set; } // "Healthy", "Warning", "Critical"
        public decimal UtilizationPercentage { get; set; }
        public decimal EstimatedBudget { get; set; }
        public decimal ActualCost { get; set; }
    }
}

namespace NJS.Application.Dtos
{
    /// <summary>
    /// DTO representing the budget health status of a project
    /// </summary>
    public class BudgetHealthDto
    {
        /// <summary>
        /// The project ID
        /// </summary>
        public int ProjectId { get; set; }

        /// <summary>
        /// Budget health status: "Healthy", "Warning", or "Critical"
        /// </summary>
        public string Status { get; set; }

        /// <summary>
        /// Budget utilization percentage (ActualCost / EstimatedBudget * 100)
        /// </summary>
        public decimal UtilizationPercentage { get; set; }

        /// <summary>
        /// The estimated budget for the project
        /// </summary>
        public decimal EstimatedBudget { get; set; }

        /// <summary>
        /// The actual cost incurred so far
        /// </summary>
        public decimal ActualCost { get; set; }
    }
}

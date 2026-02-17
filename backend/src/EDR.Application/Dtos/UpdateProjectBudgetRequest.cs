using System.ComponentModel.DataAnnotations;
using EDR.Application.Attributes;

namespace EDR.Application.Dtos{
    /// <summary>
    /// Request model for updating project budget fields
    /// </summary>
    [AtLeastOneBudgetField]
    public class UpdateProjectBudgetRequest
    {
        /// <summary>
        /// The estimated total cost of the project
        /// </summary>
        [Range(0, double.MaxValue, ErrorMessage = "Estimated project cost must be greater than or equal to 0")]
        public decimal? EstimatedProjectCost { get; set; }

        /// <summary>
        /// The estimated fee for the project
        /// </summary>
        [Range(0, double.MaxValue, ErrorMessage = "Estimated project fee must be greater than or equal to 0")]
        public decimal? EstimatedProjectFee { get; set; }

        /// <summary>
        /// Optional reason for the budget change (max 500 characters)
        /// </summary>
        [MaxLength(500, ErrorMessage = "Reason cannot exceed 500 characters")]
        public string? Reason { get; set; }
    }
}

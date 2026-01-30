using System.ComponentModel.DataAnnotations;
using NJS.Application.Dtos;

namespace NJS.Application.Attributes
{
    /// <summary>
    /// Validation attribute to ensure at least one budget field is provided
    /// </summary>
    public class AtLeastOneBudgetFieldAttribute : ValidationAttribute
    {
        public override bool IsValid(object? value)
        {
            if (value is UpdateProjectBudgetRequest request)
            {
                return request.EstimatedProjectCost.HasValue || request.EstimatedProjectFee.HasValue;
            }
            
            return false;
        }

        public override string FormatErrorMessage(string name)
        {
            return "At least one budget field (EstimatedProjectCost or EstimatedProjectFee) must be provided";
        }
    }
}
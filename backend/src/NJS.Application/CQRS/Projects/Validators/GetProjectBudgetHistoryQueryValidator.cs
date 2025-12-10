using FluentValidation;
using NJS.Application.CQRS.Projects.Queries;

namespace NJS.Application.CQRS.Projects.Validators
{
    public class GetProjectBudgetHistoryQueryValidator : AbstractValidator<GetProjectBudgetHistoryQuery>
    {
        public GetProjectBudgetHistoryQueryValidator()
        {
            RuleFor(x => x.ProjectId)
                .GreaterThan(0)
                .WithMessage("ProjectId must be greater than 0");

            RuleFor(x => x.FieldName)
                .Must(BeValidFieldName)
                .When(x => !string.IsNullOrEmpty(x.FieldName))
                .WithMessage("FieldName must be either 'EstimatedProjectCost' or 'EstimatedProjectFee'");

            RuleFor(x => x.PageNumber)
                .GreaterThan(0)
                .WithMessage("PageNumber must be greater than 0");

            RuleFor(x => x.PageSize)
                .GreaterThan(0)
                .LessThanOrEqualTo(100)
                .WithMessage("PageSize must be between 1 and 100");
        }

        private bool BeValidFieldName(string? fieldName)
        {
            if (string.IsNullOrEmpty(fieldName))
                return true;

            return fieldName == "EstimatedProjectCost" || fieldName == "EstimatedProjectFee";
        }
    }
}
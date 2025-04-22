using FluentValidation;
using NJS.Application.CQRS.Correspondence.Commands;

namespace NJS.API.Tests.CQRS.Correspondence.Validators
{
    public class CreateCorrespondenceOutwardCommandValidator : AbstractValidator<CreateCorrespondenceOutwardCommand>
    {
        public CreateCorrespondenceOutwardCommandValidator()
        {
            RuleFor(x => x.ProjectId).GreaterThan(0).WithMessage("Project ID is required");
            RuleFor(x => x.LetterNo).NotEmpty().WithMessage("Letter Number is required");
            RuleFor(x => x.To).NotEmpty().WithMessage("To is required");
            RuleFor(x => x.Subject).NotEmpty().WithMessage("Subject is required");
        }
    }
}

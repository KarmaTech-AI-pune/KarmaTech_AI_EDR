using FluentValidation;
using EDR.Application.CQRS.Correspondence.Commands;

namespace EDR.API.Tests.CQRS.Correspondence.Validators
{
    public class UpdateCorrespondenceOutwardCommandValidator : AbstractValidator<UpdateCorrespondenceOutwardCommand>
    {
        public UpdateCorrespondenceOutwardCommandValidator()
        {
            RuleFor(x => x.Id).GreaterThan(0).WithMessage("ID is required");
            RuleFor(x => x.ProjectId).GreaterThan(0).WithMessage("Project ID is required");
            RuleFor(x => x.LetterNo).NotEmpty().WithMessage("Letter Number is required");
            RuleFor(x => x.To).NotEmpty().WithMessage("To is required");
            RuleFor(x => x.Subject).NotEmpty().WithMessage("Subject is required");
        }
    }
}


using FluentValidation;
using EDR.Application.CQRS.Correspondence.Commands;

namespace EDR.API.Tests.CQRS.Correspondence.Validators
{
    public class CreateCorrespondenceInwardCommandValidator : AbstractValidator<CreateCorrespondenceInwardCommand>
    {
        public CreateCorrespondenceInwardCommandValidator()
        {
            RuleFor(x => x.ProjectId).GreaterThan(0).WithMessage("Project ID is required");
            RuleFor(x => x.IncomingLetterNo).NotEmpty().WithMessage("Incoming Letter Number is required");
            RuleFor(x => x.EdrInwardNo).NotEmpty().WithMessage("EDR Inward Number is required");
            RuleFor(x => x.From).NotEmpty().WithMessage("From is required");
            RuleFor(x => x.Subject).NotEmpty().WithMessage("Subject is required");
        }
    }
}



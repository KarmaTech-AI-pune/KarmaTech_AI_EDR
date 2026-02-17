using FluentValidation;
using EDR.Application.CQRS.Correspondence.Commands;

namespace EDR.API.Tests.CQRS.Correspondence.Validators
{
    public class UpdateCorrespondenceInwardCommandValidator : AbstractValidator<UpdateCorrespondenceInwardCommand>
    {
        public UpdateCorrespondenceInwardCommandValidator()
        {
            RuleFor(x => x.Id).GreaterThan(0).WithMessage("ID is required");
            RuleFor(x => x.ProjectId).GreaterThan(0).WithMessage("Project ID is required");
            RuleFor(x => x.IncomingLetterNo).NotEmpty().WithMessage("Incoming Letter Number is required");
            RuleFor(x => x.NjsInwardNo).NotEmpty().WithMessage("NJS Inward Number is required");
            RuleFor(x => x.From).NotEmpty().WithMessage("From is required");
            RuleFor(x => x.Subject).NotEmpty().WithMessage("Subject is required");
        }
    }
}


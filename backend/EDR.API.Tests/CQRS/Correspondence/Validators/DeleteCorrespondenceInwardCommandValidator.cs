using FluentValidation;
using EDR.Application.CQRS.Correspondence.Commands;

namespace EDR.API.Tests.CQRS.Correspondence.Validators
{
    public class DeleteCorrespondenceInwardCommandValidator : AbstractValidator<DeleteCorrespondenceInwardCommand>
    {
        public DeleteCorrespondenceInwardCommandValidator()
        {
            RuleFor(x => x.Id).GreaterThan(0).WithMessage("ID is required");
        }
    }
}


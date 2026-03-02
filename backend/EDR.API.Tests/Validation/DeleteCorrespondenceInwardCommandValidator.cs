using FluentValidation;
using EDR.Application.CQRS.Correspondence.Commands;

namespace EDR.API.Tests.Validation
{
    public class DeleteCorrespondenceInwardCommandValidator : AbstractValidator<DeleteCorrespondenceInwardCommand>
    {
        public DeleteCorrespondenceInwardCommandValidator()
        {
            RuleFor(x => x.Id)
                .GreaterThan(0)
                .WithMessage("Invalid Id");
        }
    }
}


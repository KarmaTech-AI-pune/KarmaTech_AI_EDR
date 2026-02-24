using FluentValidation;
using EDR.Application.CQRS.Correspondence.Commands;

namespace EDR.API.Tests.Validation
{
    public class DeleteCorrespondenceOutwardCommandValidator : AbstractValidator<DeleteCorrespondenceOutwardCommand>
    {
        public DeleteCorrespondenceOutwardCommandValidator()
        {
            RuleFor(x => x.Id)
                .GreaterThan(0)
                .WithMessage("Invalid Id");
        }
    }
}


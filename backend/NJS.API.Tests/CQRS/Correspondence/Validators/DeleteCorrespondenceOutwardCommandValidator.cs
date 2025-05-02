using FluentValidation;
using NJS.Application.CQRS.Correspondence.Commands;

namespace NJS.API.Tests.CQRS.Correspondence.Validators
{
    public class DeleteCorrespondenceOutwardCommandValidator : AbstractValidator<DeleteCorrespondenceOutwardCommand>
    {
        public DeleteCorrespondenceOutwardCommandValidator()
        {
            RuleFor(x => x.Id).GreaterThan(0).WithMessage("ID is required");
        }
    }
}

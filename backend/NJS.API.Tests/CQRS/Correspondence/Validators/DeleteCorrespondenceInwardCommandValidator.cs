using FluentValidation;
using NJS.Application.CQRS.Correspondence.Commands;

namespace NJS.API.Tests.CQRS.Correspondence.Validators
{
    public class DeleteCorrespondenceInwardCommandValidator : AbstractValidator<DeleteCorrespondenceInwardCommand>
    {
        public DeleteCorrespondenceInwardCommandValidator()
        {
            RuleFor(x => x.Id).GreaterThan(0).WithMessage("ID is required");
        }
    }
}

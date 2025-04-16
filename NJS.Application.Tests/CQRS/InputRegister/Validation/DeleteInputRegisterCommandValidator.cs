using FluentValidation;
using NJS.Application.Tests.CQRS.InputRegister.Commands;

namespace NJS.Application.Tests.CQRS.InputRegister.Validation
{
    public class DeleteInputRegisterCommandValidator : AbstractValidator<DeleteInputRegisterCommand>
    {
        public DeleteInputRegisterCommandValidator()
        {
            RuleFor(x => x.Id)
                .GreaterThan(0)
                .WithMessage("Invalid Id");
        }
    }
}

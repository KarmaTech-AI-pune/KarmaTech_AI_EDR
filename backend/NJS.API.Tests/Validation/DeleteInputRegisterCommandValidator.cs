using FluentValidation;
using NJS.Application.CQRS.InputRegister.Commands;

namespace NJS.API.Tests.Validation
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

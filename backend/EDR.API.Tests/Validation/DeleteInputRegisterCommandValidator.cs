using FluentValidation;
using EDR.Application.CQRS.InputRegister.Commands;

namespace EDR.API.Tests.Validation
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


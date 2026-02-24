using MediatR;
using EDR.Application.DTOs;

namespace EDR.Application.CQRS.CreateAccount
{
    public class CreateAccountCommand : IRequest<bool>
    {
        public CreateAccountDto CreateAccountDto { get; set; }
    }
}


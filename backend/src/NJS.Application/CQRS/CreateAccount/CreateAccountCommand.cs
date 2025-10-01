using MediatR;
using NJS.Application.DTOs;

namespace NJS.Application.CQRS.CreateAccount
{
    public class CreateAccountCommand : IRequest<bool>
    {
        public CreateAccountDto CreateAccountDto { get; set; }
    }
}

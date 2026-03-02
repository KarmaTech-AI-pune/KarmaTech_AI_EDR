using MediatR;

namespace EDR.Application.CQRS.Users.Commands
{
    public class DeleteUserCommand : IRequest<bool>
    {
        public string Id { get; }

        public DeleteUserCommand(string id)
        {
            Id = id;
        }
    }
}


using MediatR;

namespace EDR.Application.CQRS.Roles.Commands
{
    public class DeleteRoleCommand: IRequest<bool>
    {
        public string Id { get; }

        public DeleteRoleCommand(string id)
        {
            Id = id;
        }

       
    }
}


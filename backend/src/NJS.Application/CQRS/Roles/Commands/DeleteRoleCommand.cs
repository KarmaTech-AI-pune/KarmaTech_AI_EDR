using MediatR;

namespace NJS.Application.CQRS.Roles.Commands
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

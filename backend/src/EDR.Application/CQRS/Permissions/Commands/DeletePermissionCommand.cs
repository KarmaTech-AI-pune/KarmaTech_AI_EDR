using MediatR;

namespace EDR.Application.CQRS.Permissions.Commands
{
    public class DeletePermissionCommand : IRequest<bool>
    {
        public int Id { get; }

        public DeletePermissionCommand(int id)
        {
            Id = id;
        }
    }
}


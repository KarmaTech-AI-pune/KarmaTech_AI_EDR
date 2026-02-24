using MediatR;
using EDR.Application.Dtos;

namespace EDR.Application.CQRS.Permissions.Commands
{
    public class UpdatePermissionCommand : IRequest<bool>
    {
        public PermissionDto PermissionDto { get; }

        public UpdatePermissionCommand(PermissionDto permissionDto)
        {
            PermissionDto = permissionDto;
        }
    }
}


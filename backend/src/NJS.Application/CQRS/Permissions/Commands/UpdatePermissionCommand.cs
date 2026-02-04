using MediatR;
using NJS.Application.Dtos;

namespace NJS.Application.CQRS.Permissions.Commands
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

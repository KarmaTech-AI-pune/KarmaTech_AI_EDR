using MediatR;
using NJS.Application.Dtos;

namespace NJS.Application.CQRS.Permissions.Commands
{
    public class CreatePermissionCommand : IRequest<int>
    {
        public PermissionDto PermissionDto { get; }

        public CreatePermissionCommand(PermissionDto permissionDto)
        {
            PermissionDto = permissionDto;
        }
    }
}

using MediatR;
using EDR.Application.Dtos;

namespace EDR.Application.CQRS.Permissions.Commands
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


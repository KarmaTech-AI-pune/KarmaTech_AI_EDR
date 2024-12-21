using System.Collections.Generic;
using MediatR;

namespace NJS.Application.CQRS.Users.Commands
{
    public class UpdateRolePermissionsCommand : IRequest<bool>
    {
        public string RoleId { get; set; }
        public List<int> PermissionIds { get; set; }

        public UpdateRolePermissionsCommand(string roleId, List<int> permissionIds)
        {
            RoleId = roleId;
            PermissionIds = permissionIds;
        }
    }
}

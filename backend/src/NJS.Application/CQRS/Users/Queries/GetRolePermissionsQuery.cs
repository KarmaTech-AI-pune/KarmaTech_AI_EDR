using System.Collections.Generic;
using MediatR;
using NJS.Application.Dtos;

namespace NJS.Application.CQRS.Users.Queries
{
    public class GetRolePermissionsQuery : IRequest<IEnumerable<PermissionDto>>
    {
        public string RoleId { get; }

        public GetRolePermissionsQuery(string roleId)
        {
            RoleId = roleId;
        }
    }
}

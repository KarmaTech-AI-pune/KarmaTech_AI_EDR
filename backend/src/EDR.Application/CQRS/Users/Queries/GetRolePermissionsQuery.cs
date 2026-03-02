using System.Collections.Generic;
using MediatR;
using EDR.Application.Dtos;

namespace EDR.Application.CQRS.Users.Queries
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


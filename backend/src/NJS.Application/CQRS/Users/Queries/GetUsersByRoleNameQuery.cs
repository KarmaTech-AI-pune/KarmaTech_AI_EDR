using System.Collections.Generic;
using MediatR;
using NJS.Application.Dtos;

namespace NJS.Application.CQRS.Users.Queries
{
    public class GetUsersByRoleNameQuery : IRequest<IEnumerable<UserDto>>
    {
        public string RoleName { get; set; }

        public GetUsersByRoleNameQuery(string roleName)
        {
            RoleName = roleName;
        }
    }
}

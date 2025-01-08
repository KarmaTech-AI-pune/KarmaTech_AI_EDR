using MediatR;
using NJS.Application.Dtos;
using System.Collections.Generic;

namespace NJS.Application.CQRS.Users.Queries
{
    public class GetUsersByRoleNameQuery : IRequest<List<UserDto>>
    {
        public string RoleName { get; set; }

        public GetUsersByRoleNameQuery(string roleName)
        {
            RoleName = roleName;
        }
    }
}

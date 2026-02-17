using MediatR;
using EDR.Application.Dtos;
using System.Collections.Generic;

namespace EDR.Application.CQRS.Users.Queries
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


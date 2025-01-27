using MediatR;
using NJS.Application.Dtos;
using NJS.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace NJS.Application.CQRS.Users.Queries
{
    public class GetRoleByNameQuery :IRequest<RoleDto>
    {
        public string RoleName { get; set; }
        public GetRoleByNameQuery(string RoleName)
        {
            this.RoleName = RoleName;
        }
    }
}

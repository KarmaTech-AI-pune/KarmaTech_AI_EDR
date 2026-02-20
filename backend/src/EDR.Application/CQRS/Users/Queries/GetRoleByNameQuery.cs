using MediatR;
using EDR.Application.Dtos;
using EDR.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EDR.Application.CQRS.Users.Queries
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


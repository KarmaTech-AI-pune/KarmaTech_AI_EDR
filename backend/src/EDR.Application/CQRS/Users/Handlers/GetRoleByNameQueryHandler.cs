using MediatR;
using Microsoft.AspNetCore.Identity;
using EDR.Application.CQRS.Users.Queries;
using EDR.Application.Dtos;
using EDR.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EDR.Application.CQRS.Users.Handlers
{
    public class GetRoleByNameQueryHandler : IRequestHandler<GetRoleByNameQuery, RoleDto>
    {
        private readonly RoleManager<Role> _roleManager;

        public GetRoleByNameQueryHandler(RoleManager<Role> roleManager)
        {
            _roleManager = roleManager;
        }

        public async Task<RoleDto> Handle(GetRoleByNameQuery request, CancellationToken cancellationToken)
        {
            Role result = await _roleManager.FindByNameAsync(request.RoleName.ToLower()).ConfigureAwait(false);
            return new RoleDto
            {
                Id = result.Id,
                Name = result.Name,
            };
        }
    }
}


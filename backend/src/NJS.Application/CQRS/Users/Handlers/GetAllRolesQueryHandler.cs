using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using NJS.Application.CQRS.Users.Queries;
using NJS.Domain.Entities;

namespace NJS.Application.CQRS.Users.Handlers
{
    public class GetAllRolesQueryHandler : IRequestHandler<GetAllRolesQuery, IEnumerable<Role>>
    {
        private readonly RoleManager<Role> _roleManager;

        public GetAllRolesQueryHandler(RoleManager<Role> roleManager)
        {
            _roleManager = roleManager ?? throw new ArgumentNullException(nameof(roleManager));
        }

        public async Task<IEnumerable<Role>> Handle(GetAllRolesQuery request, CancellationToken cancellationToken)
        {
            return await _roleManager.Roles                
                .ToListAsync(cancellationToken);
        }
    }
}

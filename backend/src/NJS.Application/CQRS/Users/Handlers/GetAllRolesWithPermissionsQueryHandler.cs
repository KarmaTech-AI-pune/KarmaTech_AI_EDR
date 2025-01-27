using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using NJS.Application.CQRS.Users.Queries;
using NJS.Application.Dtos;
using NJS.Domain.Entities;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace NJS.Application.CQRS.Users.Handlers
{
    public class GetAllRolesWithPermissionsQueryHandler : IRequestHandler<GetAllRolesWithPermissionsQuery, IList<RoleDefination>>
    {
        private readonly RoleManager<Role> _roleManager;

        public GetAllRolesWithPermissionsQueryHandler(RoleManager<Role> roleManager)
        {
            _roleManager = roleManager;
        }

        public async Task<IList<RoleDefination>> Handle(GetAllRolesWithPermissionsQuery request, CancellationToken cancellationToken)
        {
            var roles = await _roleManager.Roles.ToListAsync(cancellationToken);
            var roleDefinations = new List<RoleDefination>();

            foreach (var role in roles)
            {
                var roleDefination = new RoleDefination
                {
                    Id = role.Id,
                    Name = role.Name,
                    // Example of how you might populate permissions
                    // This is a placeholder and should be replaced with your actual permission retrieval logic
                    Permissions = new List<PermissionCategory>
                    {
                        new PermissionCategory
                        {
                            Category = "General",
                            Permissions = new List<string> { "View", "Edit", "Delete" }
                        }
                    }
                };

                roleDefinations.Add(roleDefination);
            }

            return roleDefinations;
        }
    }
}

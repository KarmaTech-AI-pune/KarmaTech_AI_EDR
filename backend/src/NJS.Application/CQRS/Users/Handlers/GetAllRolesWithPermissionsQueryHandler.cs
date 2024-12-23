using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using NJS.Application.CQRS.Users.Queries;
using NJS.Application.Dtos;
using NJS.Domain.Entities;
using NJS.Repositories.Interfaces;
using System.Collections.Generic;

namespace NJS.Application.CQRS.Users.Handlers
{
    public class GetAllRolesWithPermissionsQueryHandler : IRequestHandler<GetAllRolesWithPermissionsQuery, IList<RoleDefination>>
    {
        private readonly RoleManager<Role> _roleManager;
        private readonly IPermissionRepository _permissionRepository;

        public GetAllRolesWithPermissionsQueryHandler(RoleManager<Role> roleManager, IPermissionRepository permissionRepository)
        {
            _roleManager = roleManager ?? throw new ArgumentNullException(nameof(roleManager));
            _permissionRepository = permissionRepository;
        }


        public async Task<IList<RoleDefination>> Handle(GetAllRolesWithPermissionsQuery request, CancellationToken cancellationToken)
        {
            var roles = await _roleManager.Roles.ToListAsync(cancellationToken);
            List<RoleDefination> roleDefinations = [];

            foreach (var role in roles)
            {
                var roleDefination = new RoleDefination
                {
                    Id = role.Id,
                    Name = role.Name,
                    Permissions = new List<PermissionCategoryGroup>()
                };

                var permissions = await _permissionRepository.GetPermissionsByRoleId(role.Id).ConfigureAwait(false);
                var permissionDtos = permissions.Select(permission => new PermissionDto
                {
                    Id = permission.Id,
                    Name = permission.Name,
                    Category = permission.Category,
                }).ToList();

                // Group permissions by Category
                var groupedPermissions = permissionDtos
                    .GroupBy(p => p.Category)
                    .Select(g => new PermissionCategoryGroup
                    {
                        Category = g.Key,
                        Permissions = g.ToList()
                    }).ToList();

                // Store the grouped permissions in the GroupedPermissions property
                roleDefination.Permissions = groupedPermissions;

                // Optionally, you can still flatten the permissions if needed
                //roleDefination.Permissions.AddRange(permissionDtos);

                roleDefinations.Add(roleDefination);
            }

            return roleDefinations;
        }
    }
}


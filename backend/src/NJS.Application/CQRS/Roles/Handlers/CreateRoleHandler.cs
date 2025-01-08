﻿using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using NJS.Application.CQRS.Roles.Commands;
using NJS.Application.Dtos;
using NJS.Domain.Database;
using NJS.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace NJS.Application.CQRS.Roles.Handlers
{
    public class CreateRoleHandler : IRequestHandler<CreateRoleCommands, bool>
    {
        private readonly ProjectManagementContext _context;
        private readonly RoleManager<Role> _roleManager;
        public CreateRoleHandler(ProjectManagementContext context, RoleManager<Role> roleManager)
        {
            _context = context;
            _roleManager = roleManager;
        }

        public async Task<bool> Handle(CreateRoleCommands request, CancellationToken cancellationToken)
        {
            if (request.RoleDefination == null)
            {
                throw new ArgumentNullException(nameof(request.RoleDefination), "Role definition cannot be null.");
            }

            try
            {
                var roleName = string.IsNullOrWhiteSpace(request.RoleDefination.Name) 
                    ? throw new InvalidOperationException("Role name cannot be null or empty.") 
                    : request.RoleDefination.Name;

                var rolePermissions = request.RoleDefination.Permissions ?? new List<PermissionCategory>();

                var role = new Role
                {
                    Name = roleName,
                    MinRate = 0,
                    IsResourceRole = false,
                    RolePermissions = new List<RolePermission>()
                };
                var createResult = await _roleManager.CreateAsync(role);
                if (!createResult.Succeeded)
                {
                    throw new InvalidOperationException($"Failed to create role: {string.Join(", ", createResult.Errors.Select(e => e.Description))}");
                }

                var existingPermissions = _context.Set<RolePermission>().Where(rp => rp.RoleId == role.Id);
                _context.Set<RolePermission>().RemoveRange(existingPermissions);

                // Find actual permission IDs from the database
                var newRolePermissions = new List<RolePermission>();
                foreach (var category in rolePermissions)
                {
                    if (category.Permissions != null)
                    {
                        foreach (var permissionName in category.Permissions)
                        {
                            var permission = await _context.Permissions
                                .FirstOrDefaultAsync(p => p.Name == permissionName, cancellationToken);

                            if (permission != null)
                            {
                                newRolePermissions.Add(new RolePermission
                                {
                                    RoleId = role.Id,
                                    PermissionId = permission.Id,
                                    CreatedAt = DateTime.UtcNow
                                });
                            }
                            else
                            {
                                // Optional: Log or handle unknown permissions
                                Console.WriteLine($"Permission not found: {permissionName}");
                            }
                        }
                    }
                }

                await _context.Set<RolePermission>().AddRangeAsync(newRolePermissions, cancellationToken);

                await _context.SaveChangesAsync(cancellationToken);

                return true;
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException("An error occurred while creating the role.", ex);
            }
        }
    }
}

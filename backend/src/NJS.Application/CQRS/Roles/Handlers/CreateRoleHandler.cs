using MediatR;
using Microsoft.AspNetCore.Identity;
using NJS.Application.CQRS.Roles.Commands;
using NJS.Domain.Database;
using NJS.Domain.Entities;

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
            try
            {
                var role = new Role
                {
                    Name = request.RoleDefination.Name,
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

                var newRolePermissions = request.RoleDefination.Permissions
                    .SelectMany(category => category.Permissions)
                    .Select(permission => new RolePermission
                    {
                        RoleId = role.Id,
                        PermissionId = permission.Id,
                        CreatedAt = DateTime.UtcNow
                    }).ToList();

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

using MediatR;
using Microsoft.AspNetCore.Identity;
using NJS.Application.CQRS.Users.Commands;
using NJS.Application.Dtos;
using NJS.Domain.Entities;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace NJS.Application.CQRS.Users.Handlers
{
    public class UpdateRolePermissionsCommandHandler : IRequestHandler<UpdateRolePermissionsCommand>
    {
        private readonly RoleManager<Role> _roleManager;

        public UpdateRolePermissionsCommandHandler(RoleManager<Role> roleManager)
        {
            _roleManager = roleManager;
        }

        public async Task Handle(UpdateRolePermissionsCommand request, CancellationToken cancellationToken)
        {
            var role = await _roleManager.FindByIdAsync(request.RoleId);
            if (role == null)
            {
                throw new System.InvalidOperationException($"Role with ID {request.RoleId} not found.");
            }

            // Flatten permissions from categories
            var allPermissions = request.RoleDefination.Permissions
                .SelectMany(category => category.Permissions)
                .Distinct()
                .ToList();

            // Update role name if changed
            if (role.Name != request.RoleDefination.Name)
            {
                var renameResult = await _roleManager.SetRoleNameAsync(role, request.RoleDefination.Name);
                if (!renameResult.Succeeded)
                {
                    throw new System.InvalidOperationException("Failed to update role name.");
                }
            }

            // Note: Actual permission management depends on your specific implementation
            // This might involve:
            // 1. Removing existing claims
            // 2. Adding new claims based on permissions
            // 3. Using a custom permission system
            
            // Example of how you might update claims (pseudo-code):
            // await _roleManager.RemoveClaimsAsync(role, await _roleManager.GetClaimsAsync(role));
            // foreach (var permission in allPermissions)
            // {
            //     await _roleManager.AddClaimAsync(role, new Claim("Permission", permission));
            // }

            // Persist changes
            var updateResult = await _roleManager.UpdateAsync(role);
            if (!updateResult.Succeeded)
            {
                throw new System.InvalidOperationException("Failed to update role.");
            }
        }
    }
}

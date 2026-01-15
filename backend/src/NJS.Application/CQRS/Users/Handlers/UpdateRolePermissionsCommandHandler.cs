using MediatR;
using Microsoft.EntityFrameworkCore;
using NJS.Application.CQRS.Users.Commands;
using NJS.Application.Services.IContract;
using NJS.Domain.Database;
using NJS.Domain.Entities;

namespace NJS.Application.CQRS.Users.Handlers
{
    public class UpdateRolePermissionsCommandHandler : IRequestHandler<UpdateRolePermissionsCommand, bool>
    {
        private readonly ProjectManagementContext _context;
        private readonly IUserContext _userContext;


        public UpdateRolePermissionsCommandHandler(ProjectManagementContext context, IUserContext userContext)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
            _userContext = userContext;
        }

        public async Task<bool> Handle(UpdateRolePermissionsCommand request, CancellationToken cancellationToken)
        {
            try
            {
                // Get the role with its current permissions
                var role = await _context.Set<Role>()
                    .Include(r => r.RolePermissions)
                    .FirstOrDefaultAsync(r => r.Id == request.RoleId, cancellationToken);

                if (role == null)
                {
                    throw new InvalidOperationException($"Role with ID {request.RoleId} not found.");
                }

                // Remove existing role permissions
role.MinRate= request.RoleDefination.MinRate;
                role.IsResourceRole =request.RoleDefination.IsResourceRole;
                role.Name = request.RoleDefination.Name;
                role.NormalizedName = request.RoleDefination.Name.ToUpperInvariant();
                _context.Set<RolePermission>().RemoveRange(role.RolePermissions);

                // Add new role permissions

                var newRolePermissions = request.RoleDefination.Permissions
               .SelectMany(category => category.Permissions)
               .Select(permission => new RolePermission
               {
                   RoleId = role.Id,
                   PermissionId = permission.Id,
                   CreatedBy = _userContext.GetCurrentUserId(),
                   CreatedAt = DateTime.UtcNow
               }).ToList();

                await _context.Set<RolePermission>().AddRangeAsync(newRolePermissions, cancellationToken);
                await _context.SaveChangesAsync(cancellationToken);

                return true;
            }
            catch (Exception)
            {
                // await transaction.RollbackAsync(cancellationToken);
                throw;
            }
        }
    }
}

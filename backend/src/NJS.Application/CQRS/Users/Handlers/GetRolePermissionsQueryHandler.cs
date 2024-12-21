using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NJS.Application.CQRS.Users.Queries;
using NJS.Domain.Database;
using NJS.Application.Dtos;
using NJS.Domain.Entities;

namespace NJS.Application.CQRS.Users.Handlers
{
    public class GetRolePermissionsQueryHandler : IRequestHandler<GetRolePermissionsQuery, IEnumerable<PermissionDto>>
    {
        private readonly ProjectManagementContext _context;

        public GetRolePermissionsQueryHandler(ProjectManagementContext context)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }

        public async Task<IEnumerable<PermissionDto>> Handle(GetRolePermissionsQuery request, CancellationToken cancellationToken)
        {
            try
            {
                // Get all permissions with their role assignments
                var allPermissions = await _context.Set<Permission>()
                    .AsNoTracking()
                    .Select(p => new PermissionDto
                    {
                        Id = p.Id,
                        Name = p.Name,
                        Description = p.Description,
                        Roles = p.RolePermissions
                            .Where(rp => rp.RoleId == request.RoleId)
                            .Select(rp => new RolePermissionDto 
                            {
                                Id = rp.Role.Id,
                                Name = rp.Role.Name,
                                Description = rp.Role.Description
                            })
                            .ToList()
                    })
                    .ToListAsync(cancellationToken);

                // Verify that the role exists
                var roleExists = await _context.Set<Role>()
                    .AnyAsync(r => r.Id == request.RoleId, cancellationToken);

                if (!roleExists)
                {
                    throw new InvalidOperationException($"Role with ID {request.RoleId} not found.");
                }

                return allPermissions;
            }
            catch (Exception)
            {
                throw;
            }
        }
    }
}

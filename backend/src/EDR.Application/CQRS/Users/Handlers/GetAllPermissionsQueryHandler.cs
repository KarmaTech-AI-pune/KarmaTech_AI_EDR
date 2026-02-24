using MediatR;
using Microsoft.EntityFrameworkCore;
using EDR.Application.CQRS.Users.Queries;
using EDR.Application.Dtos;
using EDR.Domain.Database;

namespace EDR.Application.CQRS.Users.Handlers
{
    public class GetAllPermissionsQueryHandler : IRequestHandler<GetAllPermissionsQuery, IEnumerable<PermissionDto>>
    {
        private readonly ProjectManagementContext _context;

        public GetAllPermissionsQueryHandler(ProjectManagementContext context)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }

        public async Task<IEnumerable<PermissionDto>> Handle(GetAllPermissionsQuery request, CancellationToken cancellationToken)
        {
            var permissions = await _context.Set<Domain.Entities.Permission>()
                   .AsNoTracking()
                   .Select(p => new PermissionDto
                   {
                       Id = p.Id,
                       Name = p.Name,
                       Description = p.Description,
                       Roles = p.RolePermissions.Select(rp => new RolePermissionDto
                       {
                           Id = rp.Role.Id,
                           Name = rp.Role.Name,
                           Description = rp.Role.Description
                       }).ToList()
                   })
                   .ToListAsync(cancellationToken);

            return permissions;

        }
    }
}


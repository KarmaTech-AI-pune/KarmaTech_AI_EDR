using MediatR;
using EDR.Application.CQRS.Users.Queries;
using EDR.Application.Dtos;
using EDR.Repositories.Interfaces;

namespace EDR.Application.CQRS.Users.Handlers
{
    internal class GetPermissionsByGroupedByCategoryHandler : IRequestHandler<GetPermissionsByGroupedByCategoryQuery, List<PermissionCategoryGroup>>
    {
        private readonly IPermissionRepository _permissionRepository;
        public GetPermissionsByGroupedByCategoryHandler(IPermissionRepository permissionRepository)
        {
            _permissionRepository = permissionRepository;
        }
        public async Task<List<PermissionCategoryGroup>> Handle(GetPermissionsByGroupedByCategoryQuery request, CancellationToken cancellationToken)
        {
            var permissions = await _permissionRepository.GetAllAsync().ConfigureAwait(false);
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

            return groupedPermissions;
        }
    }
}


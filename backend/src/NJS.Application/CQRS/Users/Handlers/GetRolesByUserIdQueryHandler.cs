using MediatR;
using Microsoft.AspNetCore.Identity;
using NJS.Application.CQRS.Users.Queries;
using NJS.Application.Dtos;
using NJS.Domain.Entities;

namespace NJS.Application.CQRS.Users.Handlers
{
    public class GetRolesByUserIdQueryHandler : IRequestHandler<GetRolesByUserIdQuery, IList<RoleDto>>
    {
        private readonly UserManager<User> _userManager;
        private readonly RoleManager<Role> _roleManager;
        public GetRolesByUserIdQueryHandler(UserManager<User> userManager,
            RoleManager<Role> roleManager)
        {
            _userManager = userManager;
            _roleManager = roleManager;
        }
        public async Task<IList<RoleDto>> Handle(GetRolesByUserIdQuery request, CancellationToken cancellationToken)
        {
            var roles = await _userManager.GetRolesAsync(request.User);

            // Retrieve RoleDto objects for each role
            var roleDtos = new List<RoleDto>();

            foreach (var roleName in roles)
            {
                // Get the role entity by role name
                var role = await _roleManager.FindByNameAsync(roleName);

                if (role != null)
                {
                    // Map to RoleDto
                    var roleDto = new RoleDto
                    {
                        Id = role.Id, // Assuming you have an Id in Role entity
                        Name = role.Name // Assuming you have a Name in Role entity
                    };

                    roleDtos.Add(roleDto);
                }
            }

            // Return the list of RoleDto
            return roleDtos;

        }
    }
}

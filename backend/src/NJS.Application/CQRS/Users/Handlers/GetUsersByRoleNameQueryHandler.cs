using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Identity;
using NJS.Application.CQRS.Users.Queries;
using NJS.Application.Dtos;
using NJS.Domain.Entities;

namespace NJS.Application.CQRS.Users.Handlers
{
    public class GetUsersByRoleNameQueryHandler : IRequestHandler<GetUsersByRoleNameQuery, IEnumerable<UserDto>>
    {
        private readonly UserManager<User> _userManager;
        private readonly RoleManager<Role> _roleManager;
        private readonly IMediator _mediator;

        public GetUsersByRoleNameQueryHandler(
            UserManager<User> userManager,
            RoleManager<Role> roleManager,
            IMediator mediator)
        {
            _userManager = userManager;
            _roleManager = roleManager;
            _mediator = mediator;
        }

        public async Task<IEnumerable<UserDto>> Handle(GetUsersByRoleNameQuery request, CancellationToken cancellationToken)
        {
            var usersInRole = await _userManager.GetUsersInRoleAsync(request.RoleName);

            var userDtos = new List<UserDto>();
            foreach (var user in usersInRole)
            {
                var roles = await _userManager.GetRolesAsync(user);
                var permissions = new List<string>();

                var roleDto = new List<RoleDto>();
                foreach (var roleName in roles)
                {
                    var role = await _roleManager.FindByNameAsync(roleName);

                    if (role != null)
                    {
                        roleDto.Add(new RoleDto
                        {
                            Name = role.Name,
                            Id = role.Id
                        });
                        var rolePermissions = await _mediator.Send(new GetRolePermissionsQuery(role.Id));
                        permissions.AddRange(rolePermissions.Select(p => p.Name));
                    }
                }

                userDtos.Add(new UserDto
                {
                    Id = user.Id,
                    UserName = user.UserName,
                    Name = user.Name,
                    Email = user.Email,
                    StandardRate = user.StandardRate ?? 0,
                    IsConsultant = user.IsConsultant,
                    Avatar = user.Avatar,
                    Roles = roleDto,
                    Permissions = permissions.Distinct().ToList(),
                    CreatedAt = user.CreatedAt,
                    UpdatedAt = user.LastLogin.Value
                });
            }

            return userDtos;
        }
    }
}

using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using NJS.Application.Dtos;
using NJS.Application.CQRS.Users.Queries;
using NJS.Domain.Entities;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace NJS.Application.CQRS.Users.Handlers
{
    public class GetUsersByRoleNameQueryHandler : IRequestHandler<GetUsersByRoleNameQuery, List<UserDto>>
    {
        private readonly UserManager<User> _userManager;
        private readonly RoleManager<Role> _roleManager;

        public GetUsersByRoleNameQueryHandler(UserManager<User> userManager, RoleManager<Role> roleManager)
        {
            _userManager = userManager;
            _roleManager = roleManager;
        }

        public async Task<List<UserDto>> Handle(GetUsersByRoleNameQuery request, CancellationToken cancellationToken)
        {
            var role = await _roleManager.FindByNameAsync(request.RoleName);
            if (role == null)
                return new List<UserDto>();

            var usersInRole = await _userManager.GetUsersInRoleAsync(request.RoleName);

            return usersInRole.Select(user => new UserDto
            {
                Id = user.Id,
                UserName = user.UserName,
                Name = user.Name,
                Email = user.Email,
                CreatedAt = user.CreatedAt,
                UpdatedAt = user.CreatedAt, // No UpdatedAt in User entity
                StandardRate = user.StandardRate ?? 0m,
                IsConsultant = user.IsConsultant,
                Avatar = user.Avatar ?? string.Empty,
                Roles = new List<RoleDto>(), // Roles mapping needs to be implemented separately
                Permissions = new List<string>() // Permissions retrieval needs to be implemented
            }).ToList();
        }
    }
}

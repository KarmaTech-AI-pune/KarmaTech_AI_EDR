using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Identity;
using NJS.Application.CQRS.Users.Commands;
using NJS.Application.Dtos;
using NJS.Domain.Entities;

namespace NJS.Application.CQRS.Users.Handlers
{
    public class CreateUserCommandHandler : IRequestHandler<CreateUserCommand, UserDto>
    {
        private readonly UserManager<User> _userManager;
        private readonly RoleManager<Role> _roleManager;

        public CreateUserCommandHandler(
            UserManager<User> userManager,
            RoleManager<Role> roleManager)
        {
            _userManager = userManager ?? throw new ArgumentNullException(nameof(userManager));
            _roleManager = roleManager ?? throw new ArgumentNullException(nameof(roleManager));
        }

        public async Task<UserDto> Handle(CreateUserCommand request, CancellationToken cancellationToken)
        {
            var user = new User
            {
                UserName = request.UserName,
                Email = request.Email,
                StandardRate = request.StandardRate,
                IsConsultant = request.IsConsultant,
                Avatar = request.Avatar ?? $"avatar_{request.UserName}.jpg",
                EmailConfirmed = true,
                CreatedAt = DateTime.UtcNow
            };

            var result = await _userManager.CreateAsync(user, request.Password);
            if (!result.Succeeded)
            {
                var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                throw new Exception($"Failed to create user: {errors}");
            }

            // Assign roles
            if (request.Roles != null && request.Roles.Any())
            {
                foreach (var roleName in request.Roles)
                {
                    if (await _roleManager.RoleExistsAsync(roleName))
                    {
                        await _userManager.AddToRoleAsync(user, roleName);
                    }
                }
            }

            // Map to DTO
            var userRoles = await _userManager.GetRolesAsync(user);
            return new UserDto
            {
                Id = user.Id,
                UserName = user.UserName,
                Email = user.Email,
                StandardRate = user.StandardRate ?? 0m,
                IsConsultant = user.IsConsultant,
                Avatar = user.Avatar,
                Roles = userRoles.ToList(),
                CreatedAt = user.CreatedAt
            };
        }
    }
}

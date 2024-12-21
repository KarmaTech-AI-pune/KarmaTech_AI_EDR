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

        public GetUsersByRoleNameQueryHandler(UserManager<User> userManager)
        {
            _userManager = userManager;
        }

        public async Task<IEnumerable<UserDto>> Handle(GetUsersByRoleNameQuery request, CancellationToken cancellationToken)
        {
            var usersInRole = await _userManager.GetUsersInRoleAsync(request.RoleName);
            
            var userDtos = new List<UserDto>();
            foreach (var user in usersInRole)
            {
                var roles = await _userManager.GetRolesAsync(user);
                userDtos.Add(new UserDto
                {
                    Id = user.Id,
                    UserName = user.UserName,
                    Email = user.Email,
                    StandardRate = user.StandardRate ?? 0,
                    IsConsultant = user.IsConsultant,
                    Avatar = user.Avatar,
                    Roles = roles.ToList(),
                    CreatedAt = user.CreatedAt,
                    UpdatedAt = user.LastLogin
                });
            }

            return userDtos;
        }
    }
}

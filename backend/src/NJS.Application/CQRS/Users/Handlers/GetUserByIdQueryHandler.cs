using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using NJS.Application.CQRS.Users.Queries;
using NJS.Application.Dtos;
using NJS.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace NJS.Application.CQRS.Users.Handlers
{
    public class GetUserByIdQueryHandler : IRequestHandler<GetUserByIdQuery, UserDto>
    {
        private readonly UserManager<User> _userManager;
        private readonly RoleManager<Role> _roleManager;
        public GetUserByIdQueryHandler(UserManager<User> userManager, RoleManager<Role> roleManager)
        {
            _userManager = userManager;
            _roleManager = roleManager;
        }
        public async Task<UserDto> Handle(GetUserByIdQuery request, CancellationToken cancellationToken)
        {
            var query = await _userManager.Users.FirstOrDefaultAsync(x => x.Id == request.Id).ConfigureAwait(false);
            
            if (query == null)
            {
                return null; // Return null if no user is found
            }

            var roles = await _userManager.GetRolesAsync(query).ConfigureAwait(false);
            var roleDto = new List<RoleDto>();

            foreach (var item in roles)
            {
                var role = await _roleManager.Roles.FirstOrDefaultAsync(x => x.Name.Equals(item)).ConfigureAwait(false);
                if (role is null)
                {
                    continue;
                }
                roleDto.Add(new RoleDto
                {
                    Id = role.Id,
                    Name = role.Name,
                });
            }

            return new UserDto
            {
                Id = request.Id,
                UserName = query.UserName,
                Name = query.Name,
                Email = query.Email,
                StandardRate = query.StandardRate ?? 0m,
                IsConsultant = query.IsConsultant,
                Avatar = query.Avatar,
                Roles = roleDto,
                CreatedAt = query.CreatedAt
            };
        }
    }
}

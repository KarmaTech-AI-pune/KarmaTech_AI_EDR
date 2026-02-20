using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using EDR.Application.CQRS.Users.Queries;
using EDR.Application.Dtos;
using EDR.Domain.Entities;

namespace EDR.Application.CQRS.Users.Handlers
{
    public class GetAllUsersQueryHandler : IRequestHandler<GetAllUsersQuery, IEnumerable<UserDto>>
    {
        private readonly UserManager<User> _userManager;
        private readonly RoleManager<Role> _roleManager;

        public GetAllUsersQueryHandler(
            UserManager<User> userManager,
            RoleManager<Role> roleManager)
        {
            _userManager = userManager ?? throw new ArgumentNullException(nameof(userManager));
            _roleManager = roleManager ?? throw new ArgumentNullException(nameof(roleManager));
        }

        public async Task<IEnumerable<UserDto>> Handle(GetAllUsersQuery request, CancellationToken cancellationToken)
        {
            var query = _userManager.Users.AsQueryable();

            // Apply filters
            if (!string.IsNullOrEmpty(request.SearchTerm))
            {
                query = query.Where(u =>
                    u.UserName.Contains(request.SearchTerm) ||
                    u.Name.Contains(request.SearchTerm) ||
                    u.Email.Contains(request.SearchTerm));
            }

            if (request.IsConsultantFilter.HasValue)
            {
                query = query.Where(u => u.IsConsultant == request.IsConsultantFilter.Value);
            }

            // Apply sorting
            if (!string.IsNullOrEmpty(request.SortBy))
            {
                query = ApplySorting(query, request.SortBy, request.IsAscending);
            }
            else
            {
                query = query.OrderBy(u => u.UserName);
            }

            // Apply pagination
            if (request.PageSize is not null)
            {
                query = query.Skip((request.PageNumber.Value - 1) * request.PageSize.Value)
                            .Take(request.PageSize.Value);
            }

            var users = await query.ToListAsync(cancellationToken);
            var userDtos = new List<UserDto>();

            foreach (var user in users)
            {
                var roleDto = new List<RoleDto>();
                var roles = await _userManager.GetRolesAsync(user);
                foreach (var role in roles)
                {
                    var result = await _roleManager.Roles.FirstOrDefaultAsync(x => x.Name.Equals(role)).ConfigureAwait(false);
                    if (result is null)
                    {
                        continue;
                    }

                    roleDto.Add(new RoleDto
                    {
                        Id = result.Id,
                        Name = result.Name
                    });
                }

                // Apply role filter
                if (!string.IsNullOrEmpty(request.RoleFilter) && !roles.Contains(request.RoleFilter))
                {
                    continue;
                }

                userDtos.Add(new UserDto
                {
                    Id = user.Id.ToString(),
                    UserName = user.UserName,
                    Name = user.Name,
                    Email = user.Email,
                    StandardRate = user.StandardRate ?? 0m,
                    IsConsultant = user.IsConsultant,
                    Avatar = user.Avatar,
                    Roles = roleDto,
                    CreatedAt = user.CreatedAt
                });
            }

            return userDtos;
        }

        private IQueryable<User> ApplySorting(IQueryable<User> query, string sortBy, bool isAscending)
        {
            return sortBy.ToLower() switch
            {
                "username" => isAscending ? query.OrderBy(u => u.UserName) : query.OrderByDescending(u => u.UserName),
                "name" => isAscending ? query.OrderBy(u => u.Name) : query.OrderByDescending(u => u.Name),
                "email" => isAscending ? query.OrderBy(u => u.Email) : query.OrderByDescending(u => u.Email),
                "standardrate" => isAscending ? query.OrderBy(u => u.StandardRate) : query.OrderByDescending(u => u.StandardRate),
                "createdat" => isAscending ? query.OrderBy(u => u.CreatedAt) : query.OrderByDescending(u => u.CreatedAt),
                _ => query.OrderBy(u => u.UserName)
            };
        }
    }
}


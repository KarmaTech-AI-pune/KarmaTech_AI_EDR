using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using NJS.Application.CQRS.Users.Queries;
using NJS.Application.Dtos;
using NJS.Domain.Entities;

namespace NJS.Application.CQRS.Users.Handlers
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
            query = query.Skip((request.PageNumber - 1) * request.PageSize)
                        .Take(request.PageSize);

            var users = await query.ToListAsync(cancellationToken);
            var userDtos = new List<UserDto>();

            foreach (var user in users)
            {
                var roles = await _userManager.GetRolesAsync(user);
                
                // Apply role filter
                if (!string.IsNullOrEmpty(request.RoleFilter) && !roles.Contains(request.RoleFilter))
                {
                    continue;
                }

                userDtos.Add(new UserDto
                {
                    Id = user.Id,
                    UserName = user.UserName,
                    Email = user.Email,
                    StandardRate = user.StandardRate ?? 0m,
                    IsConsultant = user.IsConsultant,
                    Avatar = user.Avatar,
                    Roles = roles.ToList(),
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
                "email" => isAscending ? query.OrderBy(u => u.Email) : query.OrderByDescending(u => u.Email),
                "standardrate" => isAscending ? query.OrderBy(u => u.StandardRate) : query.OrderByDescending(u => u.StandardRate),
                "createdat" => isAscending ? query.OrderBy(u => u.CreatedAt) : query.OrderByDescending(u => u.CreatedAt),
                _ => query.OrderBy(u => u.UserName)
            };
        }
    }
}

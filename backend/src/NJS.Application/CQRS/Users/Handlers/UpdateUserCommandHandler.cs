﻿using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using NJS.Application.CQRS.Users.Commands;
using NJS.Application.Dtos;
using NJS.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace NJS.Application.CQRS.Users.Handlers
{
    public class UpdateUserCommandHandler : IRequestHandler<UpdateUserCommand, UserDto>
    {
        private readonly UserManager<User> _userManager;
        private readonly RoleManager<Role> _roleManager;

        public UpdateUserCommandHandler(
            UserManager<User> userManager,
            RoleManager<Role> roleManager)
        {
            _userManager = userManager ?? throw new ArgumentNullException(nameof(userManager));
            _roleManager = roleManager ?? throw new ArgumentNullException(nameof(roleManager));
        }

        public async Task<UserDto> Handle(UpdateUserCommand request, CancellationToken cancellationToken)
        {
            var user = await _userManager.FindByIdAsync(request.Id.ToString());
            if (user == null)
            {
                throw new Exception("User not found.");
            }

            // Update user properties
            user.UserName = request.UserName ?? user.UserName;
            user.Name = request.Name ?? user.Name;
            user.Email = request.Email ?? user.Email;
            user.StandardRate = request.StandardRate ?? user.StandardRate;
            user.IsConsultant = request.IsConsultant;
            user.Avatar = request.Avatar ?? user.Avatar;
            //user.UpdatedAt = DateTime.UtcNow;

            var result = await _userManager.UpdateAsync(user);
            if (!result.Succeeded)
            {
                var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                throw new Exception($"Failed to update user: {errors}");
            }

            // Update roles if provided
            if (request.Roles != null && request.Roles.Any())
            {
                var currentRoles = await _userManager.GetRolesAsync(user);
                IList<RoleDto> roles = [];
                foreach (var item in currentRoles)
                {
                    var role = await _roleManager.Roles.FirstOrDefaultAsync(x => x.Name.Equals(item)).ConfigureAwait(false);
                    if (role is null)
                    {
                        continue;
                    }

                    roles.Add(new RoleDto
                    {
                        Id = role.Id,
                        Name = role.Name
                    });

                }

                var rolesToAdd = request.Roles.Except(roles);
                var rolesToRemove = currentRoles.Except(request.Roles.Select(x => x.Name));

                // Remove old roles
                foreach (var roleName in rolesToRemove)
                {
                    await _userManager.RemoveFromRoleAsync(user, roleName);
                }

                // Add new roles
                foreach (var roleName in rolesToAdd)
                {
                    if (await _roleManager.RoleExistsAsync(roleName.Name))
                    {
                        await _userManager.AddToRoleAsync(user, roleName.Name);
                    }
                }
            }

            // Map to DTO
            var userRoles = await _userManager.GetRolesAsync(user);
            var roleDto = new List<RoleDto>();

            foreach (var item in userRoles)
            {
                var role = await _roleManager.Roles.FirstOrDefaultAsync(x => x.Name.Equals(item)).ConfigureAwait(false);
                if (role != null)
                {
                    roleDto.Add(new RoleDto
                    {
                        Id = role.Id,
                        Name = role.Name
                    });
                }
            }

            return new UserDto
            {
                Id = user.Id.ToString(),
                UserName = user.UserName,
                Name = user.Name,
                Email = user.Email,
                StandardRate = user.StandardRate ?? 0m,
                IsConsultant = user.IsConsultant,
                Avatar = user.Avatar,
                Roles = roleDto,
                CreatedAt = user.CreatedAt,
                //  UpdatedAt = user.UpdatedAt
            };
        }
    }

}

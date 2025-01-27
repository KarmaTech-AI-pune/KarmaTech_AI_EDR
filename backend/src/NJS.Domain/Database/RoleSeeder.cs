using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging;
using NJS.Domain.Entities;

namespace NJS.Domain.Database
{
    public class RoleSeeder
    {
        private readonly RoleManager<Role> _roleManager;
        private readonly ILogger<RoleSeeder> _logger;

        public RoleSeeder(RoleManager<Role> roleManager, ILogger<RoleSeeder> logger)
        {
            _roleManager = roleManager;
            _logger = logger;
        }

        public async Task SeedRolesAsync()
        {
            var rolesToSeed = new[]
            {
                new { Name = "Admin", Description = "Full system access with administrative privileges" },
                new { Name = "ProjectManager", Description = "Can manage projects, create and modify project details" },
                new { Name = "Analyst", Description = "Can view and analyze project data" },
                new { Name = "Viewer", Description = "Read-only access to project information" }
            };

            foreach (var roleInfo in rolesToSeed)
            {
                var existingRole = await _roleManager.FindByNameAsync(roleInfo.Name);
                
                if (existingRole == null)
                {
                    var role = new Role
                    {
                        Name = roleInfo.Name,
                        NormalizedName = roleInfo.Name.ToUpper(),
                        Description = roleInfo.Description,
                        ConcurrencyStamp = Guid.NewGuid().ToString() // Ensure unique stamp
                    };

                    var result = await _roleManager.CreateAsync(role);

                    if (result.Succeeded)
                    {
                        _logger.LogInformation($"Role {roleInfo.Name} created successfully");
                    }
                    else
                    {
                        _logger.LogError($"Failed to create role {roleInfo.Name}: {string.Join(", ", result.Errors.Select(e => e.Description))}");
                    }
                }
                else
                {
                    // Optional: Update description if needed
                    if (existingRole.Description != roleInfo.Description)
                    {
                        existingRole.Description = roleInfo.Description;
                        await _roleManager.UpdateAsync(existingRole);
                        _logger.LogInformation($"Updated description for existing role {roleInfo.Name}");
                    }
                    else
                    {
                        _logger.LogInformation($"Role {roleInfo.Name} already exists, skipping creation");
                    }
                }
            }
        }
    }
}

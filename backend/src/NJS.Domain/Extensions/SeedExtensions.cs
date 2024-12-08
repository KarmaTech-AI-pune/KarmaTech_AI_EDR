using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using NJS.Domain.Database;
using NJS.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace NJS.Domain.Extensions
{
    public  static class  SeedExtensions
    {
        public static IApplicationBuilder SeedApplicationData(this IApplicationBuilder app)
        {
            InitializeDatabaseAsync(app).GetAwaiter().GetResult();
            return app;
        }

        public static async Task InitializeDatabaseAsync(IApplicationBuilder app)
        {
            try
            {
                using var scope = app.ApplicationServices.CreateScope();
                var context = scope.ServiceProvider.GetRequiredService<ProjectManagementContext>();
                var userManager = scope.ServiceProvider.GetRequiredService<UserManager<User>>();
                var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<Role>>();

                await context.Database.MigrateAsync();

                // Seed Roles
                string[] roles = { "Admin", "Manager", "User" };
                foreach (var role in roles)
                {
                    if (!await roleManager.RoleExistsAsync(role))
                    {
                        await roleManager.CreateAsync(new Role { Name = role, Description = $"{role} role", NormalizedName = role });
                    }
                }

                // Seed Admin User
                var adminEmail = "admin@example.com";
                var adminUser = await userManager.FindByEmailAsync(adminEmail);

                if (adminUser == null)
                {
                    adminUser = new User
                    {
                        UserName = "admin",
                        Email = adminEmail,
                        EmailConfirmed = true,
                        CreatedAt = DateTime.UtcNow,
                        Avatar = "Test"
                    };

                    var result = await userManager.CreateAsync(adminUser, "Admin@123");
                    if (result.Succeeded)
                    {
                        await userManager.AddToRoleAsync(adminUser, "Admin");
                    }
                }
            }
            catch (Exception)
            {
                throw;
            }
        }
    }
}

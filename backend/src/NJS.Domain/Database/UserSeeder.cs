using Microsoft.AspNetCore.Identity;
using NJS.Domain.Entities;

namespace NJS.Domain.Database
{
    public static class UserSeeder
    {
        public static async Task SeedAdminUserAsync(
            UserManager<User> userManager, 
            RoleManager<Role> roleManager)
        {
            // Check if admin user already exists
            var adminEmail = "admin@njs.com";
            var adminUser = await userManager.FindByEmailAsync(adminEmail);

            if (adminUser == null)
            {
                // Create new admin user
                adminUser = new User
                {
                    UserName = "admin",
                    Email = adminEmail,
                    EmailConfirmed = true
                };

                // Create user with a strong password
                var result = await userManager.CreateAsync(adminUser, "NJSAdmin@2024!");

                if (result.Succeeded)
                {
                    // Ensure Admin role exists
                    var adminRole = await roleManager.FindByNameAsync("Admin");
                    if (adminRole != null)
                    {
                        // Add user to Admin role
                        await userManager.AddToRoleAsync(adminUser, "Admin");
                    }
                }
                else
                {
                    // Log or handle user creation errors
                    throw new InvalidOperationException(
                        string.Join(", ", result.Errors.Select(e => e.Description))
                    );
                }
            }
        }
    }
}

using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using NJS.Domain.Database;
using NJS.Domain.Entities;

namespace NJS.Domain.Extensions
{
    public static class SeedExtensions
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

               // await context.Database.MigrateAsync();

                // Seed Permissions
                var permissions = new[]
                {
                    // Project Permissions
                    new Permission { Name = "VIEW_PROJECT", Description = "View project details", Category = "Project" },
                    new Permission { Name = "CREATE_PROJECT", Description = "Create new projects", Category = "Project" },
                    new Permission { Name = "EDIT_PROJECT", Description = "Edit existing projects", Category = "Project" },
                    new Permission { Name = "DELETE_PROJECT", Description = "Delete projects", Category = "Project" },
                    new Permission { Name = "REVIEW_PROJECT", Description = "Review project submissions", Category = "Project" },
                    new Permission { Name = "APPROVE_PROJECT", Description = "Approve projects", Category = "Project" },
                    new Permission { Name = "SUBMIT_PROJECT_FOR_REVIEW", Description = "Submit projects for review", Category = "Project" },
                    new Permission { Name = "SUBMIT_PROJECT_FOR_APPROVAL", Description = "Submit projects for approval", Category = "Project" },

                    // Business Development Permissions
                    new Permission { Name = "VIEW_BUSINESS_DEVELOPMENT", Description = "View business development items", Category = "Business Development" },
                    new Permission { Name = "CREATE_BUSINESS_DEVELOPMENT", Description = "Create business development items", Category = "Business Development" },
                    new Permission { Name = "EDIT_BUSINESS_DEVELOPMENT", Description = "Edit business development items", Category = "Business Development" },
                    new Permission { Name = "DELETE_BUSINESS_DEVELOPMENT", Description = "Delete business development items", Category = "Business Development" },
                    new Permission { Name = "REVIEW_BUSINESS_DEVELOPMENT", Description = "Review business development items", Category = "Business Development" },
                    new Permission { Name = "APPROVE_BUSINESS_DEVELOPMENT", Description = "Approve business development items", Category = "Business Development" },
                    new Permission { Name = "SUBMIT_FOR_REVIEW", Description = "Submit items for review", Category = "Business Development" },
                    new Permission { Name = "SUBMIT_FOR_APPROVAL", Description = "Submit items for approval", Category = "Business Development" },

                    // System Permissions
                    new Permission { Name = "SYSTEM_ADMIN", Description = "Full system administration access", Category = "System" }
                };

                foreach (var permission in permissions)
                {
                    if (!context.Set<Permission>().Any(p => p.Name == permission.Name))
                    {
                        context.Add(permission);
                    }
                }
                await context.SaveChangesAsync();

                // Get all permissions from DB
                var dbPermissions = await context.Set<Permission>().ToListAsync();

                // Seed Roles
                var roles = new[]
                {
                    new { Name = "Admin", Description = "Administrator role", MinRate = 150.00m, IsResourceRole = false, Permissions = dbPermissions.Select(p => p.Name).ToArray() },
                    new { Name = "Project Manager", Description = "Project Manager role", MinRate = 120.00m, IsResourceRole = true, Permissions = new[] {
                        "VIEW_PROJECT", "CREATE_PROJECT", "EDIT_PROJECT", "DELETE_PROJECT", "SUBMIT_PROJECT_FOR_REVIEW"
                    }},
                    new { Name = "Senior Engineer", Description = "Senior Engineer role", MinRate = 100.00m, IsResourceRole = true, Permissions = new[] {
                        "VIEW_PROJECT", "CREATE_PROJECT", "EDIT_PROJECT", "DELETE_PROJECT", "REVIEW_PROJECT", "SUBMIT_FOR_APPROVAL"
                    }},
                    new { Name = "Engineer", Description = "Engineer role", MinRate = 80.00m, IsResourceRole = true, Permissions = new[] {
                        "VIEW_PROJECT", "EDIT_PROJECT"
                    }},
                    new { Name = "Designer", Description = "Designer role", MinRate = 70.00m, IsResourceRole = true, Permissions = new[] {
                        "VIEW_PROJECT", "EDIT_PROJECT"
                    }},
                    new { Name = "Consultant", Description = "Consultant role", MinRate = 90.00m, IsResourceRole = true, Permissions = new[] {
                        "VIEW_PROJECT", "EDIT_PROJECT"
                    }}
                };

                foreach (var roleData in roles)
                {
                    if (!await roleManager.RoleExistsAsync(roleData.Name))
                    {
                        var role = new Role 
                        { 
                            Name = roleData.Name,
                            Description = roleData.Description,
                            NormalizedName = roleData.Name.ToUpper(),
                            MinRate = roleData.MinRate,
                            IsResourceRole = roleData.IsResourceRole
                        };

                        var result = await roleManager.CreateAsync(role);
                        if (result.Succeeded)
                        {
                            // Create RolePermission entries
                            var dbRole = await roleManager.FindByNameAsync(roleData.Name);
                            var rolePermissions = dbPermissions
                                .Where(p => roleData.Permissions.Contains(p.Name))
                                .Select(p => new RolePermission
                                {
                                    RoleId = dbRole.Id,
                                    PermissionId = p.Id,
                                    CreatedAt = DateTime.UtcNow,
                                    CreatedBy = "System"
                                });
                            
                            context.AddRange(rolePermissions);
                            await context.SaveChangesAsync();
                        }
                    }
                }

                // Seed Admin User with all roles
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
                        StandardRate = 150.00m,
                        IsConsultant = false,
                        Avatar = "avatar_admin.jpg"
                    };

                    var result = await userManager.CreateAsync(adminUser, "Admin@123");
                    if (result.Succeeded)
                    {
                        // Assign all roles to admin
                        foreach (var roleData in roles)
                        {
                            await userManager.AddToRoleAsync(adminUser, roleData.Name);
                        }
                    }
                }

                // Seed Other Users
                var users = new[]
                {
                    new { UserName = "pm1", Email = "pm1@example.com", Role = "Project Manager", StandardRate = 120.00m, IsConsultant = false },
                    new { UserName = "senior1", Email = "senior1@example.com", Role = "Senior Engineer", StandardRate = 100.00m, IsConsultant = true },
                    new { UserName = "engineer1", Email = "engineer1@example.com", Role = "Engineer", StandardRate = 80.00m, IsConsultant = true },
                    new { UserName = "designer1", Email = "designer1@example.com", Role = "Designer", StandardRate = 70.00m, IsConsultant = true }
                };

                foreach (var userData in users)
                {
                    var user = await userManager.FindByEmailAsync(userData.Email);
                    if (user == null)
                    {
                        user = new User
                        {
                            UserName = userData.UserName,
                            Email = userData.Email,
                            EmailConfirmed = true,
                            CreatedAt = DateTime.UtcNow,
                            StandardRate = userData.StandardRate,
                            IsConsultant = userData.IsConsultant,
                            Avatar = $"avatar_{userData.UserName}.jpg"
                        };

                        var result = await userManager.CreateAsync(user, "Password@123");
                        if (result.Succeeded)
                        {
                            await userManager.AddToRoleAsync(user, userData.Role);
                        }
                    }
                }

                // Create a sample project if none exists
                if (!context.Projects.Any())
                {
                    var projectManager = await userManager.FindByNameAsync("pm1");
                    var project = new Project
                    {
                        Name = "Sample Project",
                        ClientName = "Sample Client",
                        ClientSector = "Technology",
                        Sector = "Software",
                        EstimatedCost = 100000m,
                        CapitalValue = 150000m,
                        StartDate = DateTime.UtcNow,
                        EndDate = DateTime.UtcNow.AddMonths(6),
                        Status = ProjectStatus.InProgress,
                        Progress = 0,
                        DurationInMonths = 6,
                        FundingStream = "Internal",
                        ContractType = "Fixed",
                        Currency = "USD",
                        ProjectManagerId = projectManager?.Id,
                        CreatedAt = DateTime.UtcNow,
                        CreatedBy = "System",
                        LastModifiedAt = DateTime.UtcNow,
                        LastModifiedBy = "System"
                    };
                    context.Projects.Add(project);
                    await context.SaveChangesAsync();

                    // Create WBS for the project
                    var wbs = new WorkBreakdownStructure
                    {
                        ProjectId = project.Id,
                        Structure = "Sample Project Structure"
                    };
                    context.WorkBreakdownStructures.Add(wbs);
                    await context.SaveChangesAsync();

                    // Seed WBS Tasks
                    var tasks = new[]
                    {
                        new WBSTask
                        {
                            Title = "Project Planning",
                            Description = "Initial project planning phase",
                            Level = WBSTaskLevel.Level1,
                            WorkBreakdownStructureId = wbs.Id,
                            ResourceAllocation = 100
                        },
                        new WBSTask
                        {
                            Title = "Design",
                            Description = "Design phase activities",
                            Level = WBSTaskLevel.Level2,
                            WorkBreakdownStructureId = wbs.Id,
                            ResourceAllocation = 150
                        },
                        new WBSTask
                        {
                            Title = "Development",
                            Description = "Development phase activities",
                            Level = WBSTaskLevel.Level3,
                            WorkBreakdownStructureId = wbs.Id,
                            ResourceAllocation = 200
                        }
                    };

                    context.WBSTasks.AddRange(tasks);
                    await context.SaveChangesAsync();

                    // Assign users to WBS tasks
                    var engineer = await userManager.FindByNameAsync("engineer1");
                    
                    foreach (var task in tasks)
                    {
                        var userWBSTask = new UserWBSTask
                        {
                            UserId = engineer.Id,
                            WBSTaskId = task.Id,
                            CostRate = 80.00m,
                            ODC = 0,
                            TotalHours = 40,
                            TotalCost = 3200.00m,
                            CreatedAt = DateTime.UtcNow,
                            UpdatedAt = DateTime.UtcNow
                        };
                        context.UserWBSTasks.Add(userWBSTask);
                    }

                    await context.SaveChangesAsync();
                }
            }
            catch (Exception)
            {
                throw;
            }
        }
    }
}

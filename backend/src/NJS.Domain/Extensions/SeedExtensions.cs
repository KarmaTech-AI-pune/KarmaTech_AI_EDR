﻿using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using NJS.Domain.Database;
using NJS.Domain.Entities;
using NJS.Domain.Enums; // Add import for WBSTaskLevel
using System.Security.Authentication;

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

                await context.Database.MigrateAsync();

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
                    new { Name = "Senior Project Manager", Description = "Senior Project Manager role", MinRate = 100.00m, IsResourceRole = true, Permissions = new[] {
                        "VIEW_PROJECT", "CREATE_PROJECT", "EDIT_PROJECT", "DELETE_PROJECT", "REVIEW_PROJECT", "SUBMIT_FOR_APPROVAL"
                    }},
                    new { Name = "Regional Manager", Description = "Regional Manager is Bid form reviewer role", MinRate = 0.00m, IsResourceRole = true, Permissions = new[] {
                        "VIEW_PROJECT", "CREATE_PROJECT", "EDIT_PROJECT", "DELETE_PROJECT", "APPROVE_PROJECT", "CREATE_BUSINESS_DEVELOPMENT", "EDIT_BUSINESS_DEVELOPMENT", "DELETE_BUSINESS_DEVELOPMENT", "VIEW_BUSINESS_DEVELOPMENT", "REVIEW_BUSINESS_DEVELOPMENT", "SUBMIT_FOR_APPROVAL"
                    }},
                    new { Name = "Business Development Manager", Description = "Bid manager role", MinRate = 0.00m, IsResourceRole = true, Permissions = new[] {
                        "CREATE_BUSINESS_DEVELOPMENT", "EDIT_BUSINESS_DEVELOPMENT", "DELETE_BUSINESS_DEVELOPMENT", "VIEW_BUSINESS_DEVELOPMENT", "SUBMIT_FOR_REVIEW"
                    }},
                    new { Name = "Subject Matter Expert", Description = "Subject Matter Expert role", MinRate = 80.00m, IsResourceRole = true, Permissions = new[] {
                        "CREATE_BUSINESS_DEVELOPMENT", "EDIT_BUSINESS_DEVELOPMENT", "DELETE_BUSINESS_DEVELOPMENT", "VIEW_BUSINESS_DEVELOPMENT"
                    }},
                    new { Name = "Regional Director", Description = "Approval Manager for BD form", MinRate = 0.00m, IsResourceRole = true, Permissions = new[] {
                        "VIEW_PROJECT", "CREATE_PROJECT", "EDIT_PROJECT", "DELETE_PROJECT", "APPROVE_PROJECT", "CREATE_BUSINESS_DEVELOPMENT", "EDIT_BUSINESS_DEVELOPMENT", "DELETE_BUSINESS_DEVELOPMENT", "VIEW_BUSINESS_DEVELOPMENT", "APPROVE_BUSINESS_DEVELOPMENT"
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
                var adminEmail = "admin@test.com";
                var adminUser = await userManager.FindByEmailAsync(adminEmail);

                if (adminUser == null)
                {
                    adminUser = new User
                    {
                        UserName = "admin",
                        Name = "Administrator",
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
                else
                {
                    foreach (var roleData in roles)
                    {
                        var result = await userManager.IsInRoleAsync(adminUser, roleData.Name);
                        if (result)
                            continue;
                        await userManager.AddToRoleAsync(adminUser, roleData.Name);
                    }
                }

                // Seed Other Users
                var users = new[]
                {
                    new { UserName = "PM1", Name = "Manasi Bapat", Email = "pm1@example.com", Role = "Project Manager", StandardRate = 120.00m, IsConsultant = false },
                    new { UserName = "PM2", Name = "Salaiddin Ahemad", Email = "pm2@example.com", Role = "Project Manager", StandardRate = 120.00m, IsConsultant = false },
                    new { UserName = "SPM1", Name = "Vidyadhar Vengurlekar", Email = "spm1@example.com", Role = "Senior Project Manager", StandardRate = 120.00m, IsConsultant = false },
                    new { UserName = "SPM2", Name = "Mandar Pimputkar", Email = "spm2@example.com", Role = "Senior Project Manager", StandardRate = 120.00m, IsConsultant = false },
                    new { UserName = "RM1", Name = "Vidyadhar Sontakke", Email = "rm1@example.com", Role = "Regional Manager", StandardRate = 120.00m, IsConsultant = false },
                    new { UserName = "RM2", Name = "Sanjay Ghuleria", Email = "rm2@example.com", Role = "Regional Manager", StandardRate = 120.00m, IsConsultant = false },
                    new { UserName = "BDM1", Name = "Pravin Bhawsar", Email = "bdm1@example.com", Role = "Business Development Manager", StandardRate = 120.00m, IsConsultant = false },
                    new { UserName = "BDM2", Name = "Rohit Dembi", Email = "bdm2@example.com", Role = "Business Development Manager", StandardRate = 120.00m, IsConsultant = false },
                    new { UserName = "SME1", Name = "Nijam Ahemad", Email = "sme1@example.com", Role = "Subject Matter Expert", StandardRate = 120.00m, IsConsultant = false },
                    new { UserName = "SME2", Name = "Mnjunath Gowda", Email = "sme2@example.com", Role = "Subject Matter Expert", StandardRate = 120.00m, IsConsultant = false },
                    new { UserName = "RM3", Name = "Pradipto Sarkar", Email = "rm3@example.com", Role = "Regional Manager", StandardRate = 120.00m, IsConsultant = false },
                    new { UserName = "RD1", Name = "Yogeshwar Gokhale", Email = "rd1@example.com", Role = "Regional Director", StandardRate = 120.00m, IsConsultant = false },
                    new { UserName = "RD2", Name = "Vidyadhar S", Email = "rd2@example.com", Role = "Regional Director", StandardRate = 120.00m, IsConsultant = false }
                };

                foreach (var userData in users)
                {
                    var user = await userManager.FindByEmailAsync(userData.Email);
                    if (user == null)
                    {
                        user = new User
                        {
                            UserName = userData.UserName,
                            Name = userData.Name,
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
                        TypeOfClient = "Technology",
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
                            WorkBreakdownStructureId = wbs.Id
                            // ResourceAllocation = 100 // Commented out - Property does not exist
                        },
                        new WBSTask
                        {
                            Title = "Design",
                            Description = "Design phase activities",
                            Level = WBSTaskLevel.Level2,
                            WorkBreakdownStructureId = wbs.Id
                            // ResourceAllocation = 150 // Commented out - Property does not exist
                        },
                        new WBSTask
                        {
                            Title = "Development",
                            Description = "Development phase activities",
                            Level = WBSTaskLevel.Level3,
                            WorkBreakdownStructureId = wbs.Id
                            // ResourceAllocation = 200 // Commented out - Property does not exist
                        }
                    };

                    context.WBSTasks.AddRange(tasks);
                    await context.SaveChangesAsync();

                    // Assign users to WBS tasks

                    await context.SaveChangesAsync();
                }

                if (!context.Regions.Any())
                {
                    var regions = new List<Region>()
                    {
                        new Region() { Name = "North", Code = "NOR" },
                        new Region() { Name = "South", Code = "SOUT" },
                        new Region() { Name = "East", Code = "EA" },
                        new Region() { Name = "West", Code = "WE" },
                        new Region() { Name = "Central", Code = "CEN" }
                    };
                   
                    context.AddRangeAsync(regions);
                    context.SaveChanges();
                }
            }
            catch (Exception)
            {
                throw;
            }
        }
    }
}

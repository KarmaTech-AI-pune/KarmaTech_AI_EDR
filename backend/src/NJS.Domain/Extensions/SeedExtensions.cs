using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using NJS.Domain.Database;
using NJS.Domain.Entities;
using NJS.Domain.Enums;
using NJS.Domain.Services;

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
                var tenantDbContext = scope.ServiceProvider.GetRequiredService<TenantDbContext>();


                var options = scope.ServiceProvider.GetRequiredService<DbContextOptions<ProjectManagementContext>>();
                var httpContextAccessor = scope.ServiceProvider.GetService<IHttpContextAccessor>();
                var currentTenantService = scope.ServiceProvider.GetRequiredService<ICurrentTenantService>(); // Get ICurrentTenantService

                await using var context = new ProjectManagementContext(options, currentTenantService); // Pass currentTenantService

                var userManager = scope.ServiceProvider.GetRequiredService<UserManager<User>>();
                var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<Role>>();

                // Migrations are handled by AddAndMigrateTenantDatabases, so no need to call MigrateAsync here.
                // This method focuses on seeding data.

                if (!tenantDbContext.Tenants.Any()) { 
                    var tenet = new Tenant
                    {
                        Name = "Default Tenant",
                        CreatedAt = DateTime.UtcNow,
                        IsActive = true,
                        CompanyName = "Default Company",
                        Domain = "defaulttenant.com",
                        MaxProjects=1000000,
                        MaxUsers=10000000,
                        Status = TenantStatus.Active                        
                    };
                    tenantDbContext.Tenants.Add(tenet);
                   
                    await tenantDbContext.SaveChangesAsync();
                }

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
                    new Permission { Name = "SUBMIT_FOR_APPROVAL", Description = "Submit items for approval", Category = "Business Development" },

                    // System Permissions
                    new Permission { Name = "SYSTEM_ADMIN", Description = "Full system administration access", Category = "System" },
                    new Permission { Name = "Tenant_ADMIN", Description = "Full system administration access", Category = "System" },

                    new Permission{Name="CHECKER", Description = "Only the checker", Category = "CheckerReviewer" },
                    new Permission{Name="REVIEWER", Description = "Only  the Reviewer", Category = "CheckerReviewer" }
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
                        "VIEW_PROJECT", "CREATE_PROJECT", "EDIT_PROJECT", "DELETE_PROJECT", "REVIEW_PROJECT", "SUBMIT_PROJECT_FOR_APPROVAL", "SUBMIT_FOR_APPROVAL"
                    }},
                    new { Name = "Regional Manager", Description = "Regional Manager is Bid form reviewer role", MinRate = 0.00m, IsResourceRole = true, Permissions = new[] {
                        "VIEW_PROJECT", "CREATE_PROJECT", "EDIT_PROJECT", "DELETE_PROJECT", "APPROVE_PROJECT", "CREATE_BUSINESS_DEVELOPMENT", "EDIT_BUSINESS_DEVELOPMENT", "DELETE_BUSINESS_DEVELOPMENT", "VIEW_BUSINESS_DEVELOPMENT", "REVIEW_BUSINESS_DEVELOPMENT", "SUBMIT_FOR_APPROVAL"
                    }},
                    new { Name = "Business Development Manager", Description = "Bid manager role", MinRate = 0.00m, IsResourceRole = true, Permissions = new[] {
                        "CREATE_BUSINESS_DEVELOPMENT", "EDIT_BUSINESS_DEVELOPMENT", "DELETE_BUSINESS_DEVELOPMENT", "VIEW_BUSINESS_DEVELOPMENT"
                    }},
                    new { Name = "Subject Matter Expert", Description = "Subject Matter Expert role", MinRate = 80.00m, IsResourceRole = true, Permissions = new[] {
                        "CREATE_BUSINESS_DEVELOPMENT", "EDIT_BUSINESS_DEVELOPMENT", "DELETE_BUSINESS_DEVELOPMENT", "VIEW_BUSINESS_DEVELOPMENT"
                    }},
                    new { Name = "Regional Director", Description = "Approval Manager for BD form", MinRate = 0.00m, IsResourceRole = true, Permissions = new[] {
                        "VIEW_PROJECT", "CREATE_PROJECT", "EDIT_PROJECT", "DELETE_PROJECT", "APPROVE_PROJECT", "CREATE_BUSINESS_DEVELOPMENT", "EDIT_BUSINESS_DEVELOPMENT", "DELETE_BUSINESS_DEVELOPMENT", "VIEW_BUSINESS_DEVELOPMENT", "APPROVE_BUSINESS_DEVELOPMENT"
                    }},

                    new { Name = "Reviewer", Description = "Review the check-review form", MinRate = 0.00m, IsResourceRole = false, Permissions = new[] {"REVIEWER"}},
                    new { Name = "Checker", Description = "Check the check-review form", MinRate = 0.00m, IsResourceRole = false, Permissions = new[] {"CHECKER"}},

                     new { Name = "TenantAdmin", Description = "Tenant Administrator role", MinRate = 0m, IsResourceRole = false,  Permissions = new[] { "Tenant_ADMIN" } },

                };

                foreach (var roleData in roles)
                {
                    Role role = null;
                    if (!await roleManager.RoleExistsAsync(roleData.Name))
                    {
                        role = new Role
                        {
                            Name = roleData.Name,
                            Description = roleData.Description,
                            NormalizedName = roleData.Name.ToUpper(),
                            MinRate = roleData.MinRate,
                            IsResourceRole = roleData.IsResourceRole
                        };

                        var result = await roleManager.CreateAsync(role);
                        if (!result.Succeeded)
                        {
                            continue; // Skip if creation failed
                        }
                    }
                    else
                    {
                        role = await roleManager.FindByNameAsync(roleData.Name);
                    }

                    if (role != null)
                    {
                        // Create RolePermission entries if they don't exist
                        var dbRole = role; // Use the role object we have
                        
                        // Fetch existing permissions for this role to avoid duplicates
                        var existingRolePermissionIds = await context.RolePermissions
                            .Where(rp => rp.RoleId == dbRole.Id)
                            .Select(rp => rp.PermissionId)
                            .ToListAsync();

                        var rolePermissions = dbPermissions
                            .Where(p => roleData.Permissions.Contains(p.Name) && !existingRolePermissionIds.Contains(p.Id))
                            .Select(p => new RolePermission
                            {
                                RoleId = dbRole.Id,
                                PermissionId = p.Id,
                                CreatedAt = DateTime.UtcNow,
                                CreatedBy = "System"
                            });

                        if (rolePermissions.Any())
                        {
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

                // Seed WBSOptions if they don't exist
                await SeedWBSOptionsAsync(context);

                // Create a default program if none exists
                if (!context.Set<Program>().Any())
                {
                    var defaultProgram = new Program
                    {
                        Name = "Default Program",
                        Description = "Default program for sample projects",
                        StartDate = DateTime.UtcNow,
                        EndDate = DateTime.UtcNow.AddYears(1),
                        CreatedBy = "System",
                        LastModifiedAt = DateTime.UtcNow,
                        LastModifiedBy = "System"
                    };
                    context.Set<Program>().Add(defaultProgram);
                    await context.SaveChangesAsync();
                }

                // Create a sample project if none exists
                if (!context.Projects.Any())
                {
                    var projectManager = await userManager.FindByNameAsync("pm1");
                    var defaultProgram = await context.Set<Program>().FirstOrDefaultAsync();
                    
                    var project = new Project
                    {
                        Name = "Sample Project",
                        ClientName = "Sample Client",
                        TypeOfClient = "Technology",
                        Sector = "Software",
                        EstimatedProjectCost = 100000m,
                        EstimatedProjectFee = 80000m,
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
                        ProgramId = defaultProgram?.Id ?? 1,
                        CreatedAt = DateTime.UtcNow,
                        CreatedBy = "System",
                        LastModifiedAt = DateTime.UtcNow,
                        LastModifiedBy = "System"
                    };
                    context.Projects.Add(project);
                    await context.SaveChangesAsync();

                    // Create WBS for the project
                    var wbsHeader = new WBSHeader
                    {
                        ProjectId = project.Id
                    };
                    context.WBSHeaders.Add(wbsHeader);
                    await context.SaveChangesAsync();

                    var wbs = new WorkBreakdownStructure
                    {
                        Structure = "Sample Project Structure",
                        WBSHeaderId = wbsHeader.Id
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
                            WBSOptionId = context.WBSOptions.FirstOrDefault(wo => wo.Value == "inception_report")?.Id ?? 1
                        },
                        new WBSTask
                        {
                            Title = "Design",
                            Description = "Design phase activities",
                            Level = WBSTaskLevel.Level2,
                            WorkBreakdownStructureId = wbs.Id,
                            WBSOptionId = context.WBSOptions.FirstOrDefault(wo => wo.Value == "design" && wo.ParentId == 1)?.Id ?? 8
                        },
                        new WBSTask
                        {
                            Title = "Development",
                            Description = "Development phase activities",
                            Level = WBSTaskLevel.Level3,
                            WorkBreakdownStructureId = wbs.Id,
                            WBSOptionId = context.WBSOptions.FirstOrDefault(wo => wo.Value == "process_design")?.Id ?? 31
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

                    await context.AddRangeAsync(regions);
                    await context.SaveChangesAsync();
                }

                // Seed Scoring Tables if they don't exist
                await SeedScoringTablesAsync(context);

                // Seed Features
                await SeedFeaturesAsync(context);

                // Seed Subscription Plans and Features
                await SeedSubscriptionPlansAndFeaturesAsync(context);

                // Seed Measurement Units
                await SeedMeasurementUnitsAsync(context);
            }
            catch (Exception e)
            {
                Console.WriteLine($"An error occurred while seeding the database: {e.Message}");
                throw;
            }
        }

        private static async Task SeedMeasurementUnitsAsync(ProjectManagementContext context)
        {
            if (!context.Set<MeasurementUnit>().Any())
            {
                Console.WriteLine("MeasurementUnit table is empty, inserting data...");

                var measurementUnits = new List<MeasurementUnit>
                {
                    new MeasurementUnit { Name = "Nos", FormType = FormType.ODC, TenantId = 1 },
                    new MeasurementUnit { Name = "LS", FormType = FormType.ODC, TenantId = 1 },
                    new MeasurementUnit { Name = "Km", FormType = FormType.ODC, TenantId = 1 },
                    new MeasurementUnit { Name = "Day", FormType = FormType.Manpower, TenantId = 1 },
                    new MeasurementUnit { Name = "Month", FormType = FormType.Manpower, TenantId = 1 },
                    new MeasurementUnit { Name = "Year", FormType = FormType.Manpower, TenantId = 1 }
                };

                try
                {
                    await context.Set<MeasurementUnit>().AddRangeAsync(measurementUnits);
                    await context.SaveChangesAsync();
                    Console.WriteLine("MeasurementUnit data inserted successfully");
                }
                catch (Exception e)
                {
                    Console.WriteLine($"An error occurred while seeding measurement units: {e.Message}");
                    throw;
                }
            }
            else
            {
                Console.WriteLine("MeasurementUnit table already has data, skipping insert");
            }
        }

        private static async Task SeedFeaturesAsync(ProjectManagementContext context)
        {
            if (!context.Set<Feature>().Any())
            {
                Console.WriteLine("Feature table is empty, inserting data...");

                var features = new List<Feature>
                {
                    // Core features for all plans
                    new Feature { Name = "Work Breakdown Structure (WBS)" },
                    new Feature { Name = "ODC (Other Direct Cost) Table" },
                    new Feature { Name = "Job Start Form" },
                    new Feature { Name = "Input Register" },
                    new Feature { Name = "Email Notifications" },
                    new Feature { Name = "Monthly Progress Review" },
                    new Feature { Name = "Manpower Planning" },

                    // Starter plan specific features
                    new Feature { Name = "Basic UI" },
                    new Feature { Name = "Basic Export (PDF)" },

                    // Business plan additional features
                    new Feature { Name = "Estimated Expenses Table" },
                    new Feature { Name = "Check & Review Logs" },
                    new Feature { Name = "Quarterly Progress Review" },
                    new Feature { Name = "Enhanced UX" },

                    // Enterprise plan additional features
                    new Feature { Name = "WBS Version 2.0" },
                    new Feature { Name = "Gantt/Timeline View" },
                    new Feature { Name = "Change Control Register" },
                    new Feature { Name = "Weekly/Daily Progress Review" },
                    new Feature { Name = "Milestone Tracking" },
                    new Feature { Name = "Budget vs Actual Analysis" },
                    new Feature { Name = "API Integration" },
                    new Feature { Name = "Tailored UI/UX" }
                };

                try
                {
                    await context.Set<Feature>().AddRangeAsync(features);
                    await context.SaveChangesAsync();
                    Console.WriteLine("Feature data inserted successfully");
                }
                catch (Exception e)
                {
                    Console.WriteLine($"An error occurred while seeding features: {e.Message}");
                    throw;
                }
            }
            else
            {
                Console.WriteLine("Feature table already has data, skipping insert");
            }
        }

        private static async Task SeedSubscriptionPlansAndFeaturesAsync(ProjectManagementContext context)
        {
            // Clear existing SubscriptionPlanFeature data to reseed with correct TenantId
            if (context.Set<SubscriptionPlanFeature>().Any())
            {
                Console.WriteLine("Clearing existing SubscriptionPlanFeature data to reseed with correct TenantId...");
                context.Set<SubscriptionPlanFeature>().RemoveRange(context.Set<SubscriptionPlanFeature>());
                await context.SaveChangesAsync();
            }

            if (!context.Set<SubscriptionPlan>().Any())
            {
                Console.WriteLine("SubscriptionPlan table is empty, inserting data...");

                var starterPlan = new SubscriptionPlan { Name = "Starter", Description = "Perfect for individuals and small projects", MonthlyPrice = 100, YearlyPrice = 1000, MaxUsers = 5, MaxProjects = 5, MaxStorageGB = 10, StripePriceId = "plan_starter_2024" };
                var businessPlan = new SubscriptionPlan { Name = "Business", Description = "For small to mid-sized teams with advanced needs", MonthlyPrice = 400, YearlyPrice = 4000, MaxUsers = 20, MaxProjects = 25, MaxStorageGB = 100, StripePriceId = "plan_business_2024" };
                var enterprisePlan = new SubscriptionPlan { Name = "Enterprise", Description = "Custom solution for large organizations", MonthlyPrice = 0, YearlyPrice = 0, MaxUsers = -1, MaxProjects = -1, MaxStorageGB = -1, StripePriceId = "plan_enterprise_2024" };
                var oneTimeLicensePlan = new SubscriptionPlan { Name = "One-Time License", Description = "Lifetime access with one-time payment", MonthlyPrice = 0, YearlyPrice = 0, MaxUsers = -1, MaxProjects = -1, MaxStorageGB = -1, StripePriceId = "plan_one_time_license" };

                try
                {
                    await context.Set<SubscriptionPlan>().AddRangeAsync(starterPlan, businessPlan, enterprisePlan, oneTimeLicensePlan);
                    await context.SaveChangesAsync();
                    Console.WriteLine("SubscriptionPlan data inserted successfully");
                }
                catch (Exception e)
                {
                    Console.WriteLine($"An error occurred while seeding subscription plans: {e.Message}");
                    throw;
                }
            }
            else
            {
                Console.WriteLine("SubscriptionPlan table already has data, skipping insert");
            }

            // Always reseed feature mappings since we cleared them at the beginning
            Console.WriteLine("Reseeding SubscriptionPlan feature mappings...");

            // Get existing plans (they should exist now)
            var existingStarterPlan = await context.Set<SubscriptionPlan>().FirstOrDefaultAsync(sp => sp.Name == "Starter");
            var existingBusinessPlan = await context.Set<SubscriptionPlan>().FirstOrDefaultAsync(sp => sp.Name == "Business");
            var existingEnterprisePlan = await context.Set<SubscriptionPlan>().FirstOrDefaultAsync(sp => sp.Name == "Enterprise");
            var existingOneTimeLicensePlan = await context.Set<SubscriptionPlan>().FirstOrDefaultAsync(sp => sp.Name == "One-Time License");

            // Get all features
            var wbsFeature = await context.Set<Feature>().FirstOrDefaultAsync(f => f.Name == "Work Breakdown Structure (WBS)");
            var wbsVersion2Feature = await context.Set<Feature>().FirstOrDefaultAsync(f => f.Name == "WBS Version 2.0");
            var ganttTimelineViewFeature = await context.Set<Feature>().FirstOrDefaultAsync(f => f.Name == "Gantt/Timeline View");
            var odcTableFeature = await context.Set<Feature>().FirstOrDefaultAsync(f => f.Name == "ODC (Other Direct Cost) Table");
            var jobStartFormFeature = await context.Set<Feature>().FirstOrDefaultAsync(f => f.Name == "Job Start Form");
            var estimatedExpensesTableFeature = await context.Set<Feature>().FirstOrDefaultAsync(f => f.Name == "Estimated Expenses Table");
            var inputRegisterFeature = await context.Set<Feature>().FirstOrDefaultAsync(f => f.Name == "Input Register");
            var emailNotificationsFeature = await context.Set<Feature>().FirstOrDefaultAsync(f => f.Name == "Email Notifications");
            var checkReviewLogsFeature = await context.Set<Feature>().FirstOrDefaultAsync(f => f.Name == "Check & Review Logs");
            var changeControlRegisterFeature = await context.Set<Feature>().FirstOrDefaultAsync(f => f.Name == "Change Control Register");
            var monthlyProgressReviewFeature = await context.Set<Feature>().FirstOrDefaultAsync(f => f.Name == "Monthly Progress Review");
            var quarterlyProgressReviewFeature = await context.Set<Feature>().FirstOrDefaultAsync(f => f.Name == "Quarterly Progress Review");
            var weeklyDailyProgressReviewFeature = await context.Set<Feature>().FirstOrDefaultAsync(f => f.Name == "Weekly/Daily Progress Review");
            var milestoneTrackingFeature = await context.Set<Feature>().FirstOrDefaultAsync(f => f.Name == "Milestone Tracking");
            var budgetVsActualAnalysisFeature = await context.Set<Feature>().FirstOrDefaultAsync(f => f.Name == "Budget vs Actual Analysis");
            var manpowerPlanningFeature = await context.Set<Feature>().FirstOrDefaultAsync(f => f.Name == "Manpower Planning");
            var apiIntegrationFeature = await context.Set<Feature>().FirstOrDefaultAsync(f => f.Name == "API Integration");
            var basicUiFeature = await context.Set<Feature>().FirstOrDefaultAsync(f => f.Name == "Basic UI");
            var enhancedUxFeature = await context.Set<Feature>().FirstOrDefaultAsync(f => f.Name == "Enhanced UX");
            var tailoredUiUxFeature = await context.Set<Feature>().FirstOrDefaultAsync(f => f.Name == "Tailored UI/UX");
            var basicExportPdfFeature = await context.Set<Feature>().FirstOrDefaultAsync(f => f.Name == "Basic Export (PDF)");

            // Starter Plan Features
            if (existingStarterPlan != null)
            {
                if (wbsFeature != null) context.Set<SubscriptionPlanFeature>().Add(new SubscriptionPlanFeature { SubscriptionPlanId = existingStarterPlan.Id, FeatureId = wbsFeature.Id });
                if (odcTableFeature != null) context.Set<SubscriptionPlanFeature>().Add(new SubscriptionPlanFeature { SubscriptionPlanId = existingStarterPlan.Id, FeatureId = odcTableFeature.Id });
                if (jobStartFormFeature != null) context.Set<SubscriptionPlanFeature>().Add(new SubscriptionPlanFeature { SubscriptionPlanId = existingStarterPlan.Id, FeatureId = jobStartFormFeature.Id });
                if (inputRegisterFeature != null) context.Set<SubscriptionPlanFeature>().Add(new SubscriptionPlanFeature { SubscriptionPlanId = existingStarterPlan.Id, FeatureId = inputRegisterFeature.Id });
                if (emailNotificationsFeature != null) context.Set<SubscriptionPlanFeature>().Add(new SubscriptionPlanFeature { SubscriptionPlanId = existingStarterPlan.Id, FeatureId = emailNotificationsFeature.Id });
                if (monthlyProgressReviewFeature != null) context.Set<SubscriptionPlanFeature>().Add(new SubscriptionPlanFeature { SubscriptionPlanId = existingStarterPlan.Id, FeatureId = monthlyProgressReviewFeature.Id });
                if (manpowerPlanningFeature != null) context.Set<SubscriptionPlanFeature>().Add(new SubscriptionPlanFeature { SubscriptionPlanId = existingStarterPlan.Id, FeatureId = manpowerPlanningFeature.Id });
                if (basicUiFeature != null) context.Set<SubscriptionPlanFeature>().Add(new SubscriptionPlanFeature { SubscriptionPlanId = existingStarterPlan.Id, FeatureId = basicUiFeature.Id });
                if (basicExportPdfFeature != null) context.Set<SubscriptionPlanFeature>().Add(new SubscriptionPlanFeature { SubscriptionPlanId = existingStarterPlan.Id, FeatureId = basicExportPdfFeature.Id });
            }

            // Business Plan Features
            if (existingBusinessPlan != null)
            {
                if (wbsFeature != null) context.Set<SubscriptionPlanFeature>().Add(new SubscriptionPlanFeature { SubscriptionPlanId = existingBusinessPlan.Id, FeatureId = wbsFeature.Id });
                if (odcTableFeature != null) context.Set<SubscriptionPlanFeature>().Add(new SubscriptionPlanFeature { SubscriptionPlanId = existingBusinessPlan.Id, FeatureId = odcTableFeature.Id });
                if (jobStartFormFeature != null) context.Set<SubscriptionPlanFeature>().Add(new SubscriptionPlanFeature { SubscriptionPlanId = existingBusinessPlan.Id, FeatureId = jobStartFormFeature.Id });
                if (estimatedExpensesTableFeature != null) context.Set<SubscriptionPlanFeature>().Add(new SubscriptionPlanFeature { SubscriptionPlanId = existingBusinessPlan.Id, FeatureId = estimatedExpensesTableFeature.Id });
                if (inputRegisterFeature != null) context.Set<SubscriptionPlanFeature>().Add(new SubscriptionPlanFeature { SubscriptionPlanId = existingBusinessPlan.Id, FeatureId = inputRegisterFeature.Id });
                if (emailNotificationsFeature != null) context.Set<SubscriptionPlanFeature>().Add(new SubscriptionPlanFeature { SubscriptionPlanId = existingBusinessPlan.Id, FeatureId = emailNotificationsFeature.Id });
                if (checkReviewLogsFeature != null) context.Set<SubscriptionPlanFeature>().Add(new SubscriptionPlanFeature { SubscriptionPlanId = existingBusinessPlan.Id, FeatureId = checkReviewLogsFeature.Id });
                if (monthlyProgressReviewFeature != null) context.Set<SubscriptionPlanFeature>().Add(new SubscriptionPlanFeature { SubscriptionPlanId = existingBusinessPlan.Id, FeatureId = monthlyProgressReviewFeature.Id });
                if (quarterlyProgressReviewFeature != null) context.Set<SubscriptionPlanFeature>().Add(new SubscriptionPlanFeature { SubscriptionPlanId = existingBusinessPlan.Id, FeatureId = quarterlyProgressReviewFeature.Id });
                if (manpowerPlanningFeature != null) context.Set<SubscriptionPlanFeature>().Add(new SubscriptionPlanFeature { SubscriptionPlanId = existingBusinessPlan.Id, FeatureId = manpowerPlanningFeature.Id });
                if (enhancedUxFeature != null) context.Set<SubscriptionPlanFeature>().Add(new SubscriptionPlanFeature { SubscriptionPlanId = existingBusinessPlan.Id, FeatureId = enhancedUxFeature.Id });
                if (basicExportPdfFeature != null) context.Set<SubscriptionPlanFeature>().Add(new SubscriptionPlanFeature { SubscriptionPlanId = existingBusinessPlan.Id, FeatureId = basicExportPdfFeature.Id });
            }

            // Enterprise Plan Features
            if (existingEnterprisePlan != null)
            {
                if (wbsFeature != null) context.Set<SubscriptionPlanFeature>().Add(new SubscriptionPlanFeature { SubscriptionPlanId = existingEnterprisePlan.Id, FeatureId = wbsFeature.Id });
                if (wbsVersion2Feature != null) context.Set<SubscriptionPlanFeature>().Add(new SubscriptionPlanFeature { SubscriptionPlanId = existingEnterprisePlan.Id, FeatureId = wbsVersion2Feature.Id });
                if (ganttTimelineViewFeature != null) context.Set<SubscriptionPlanFeature>().Add(new SubscriptionPlanFeature { SubscriptionPlanId = existingEnterprisePlan.Id, FeatureId = ganttTimelineViewFeature.Id });
                if (odcTableFeature != null) context.Set<SubscriptionPlanFeature>().Add(new SubscriptionPlanFeature { SubscriptionPlanId = existingEnterprisePlan.Id, FeatureId = odcTableFeature.Id });
                if (jobStartFormFeature != null) context.Set<SubscriptionPlanFeature>().Add(new SubscriptionPlanFeature { SubscriptionPlanId = existingEnterprisePlan.Id, FeatureId = jobStartFormFeature.Id });
                if (estimatedExpensesTableFeature != null) context.Set<SubscriptionPlanFeature>().Add(new SubscriptionPlanFeature { SubscriptionPlanId = existingEnterprisePlan.Id, FeatureId = estimatedExpensesTableFeature.Id });
                if (inputRegisterFeature != null) context.Set<SubscriptionPlanFeature>().Add(new SubscriptionPlanFeature { SubscriptionPlanId = existingEnterprisePlan.Id, FeatureId = inputRegisterFeature.Id });
                if (emailNotificationsFeature != null) context.Set<SubscriptionPlanFeature>().Add(new SubscriptionPlanFeature { SubscriptionPlanId = existingEnterprisePlan.Id, FeatureId = emailNotificationsFeature.Id });
                if (checkReviewLogsFeature != null) context.Set<SubscriptionPlanFeature>().Add(new SubscriptionPlanFeature { SubscriptionPlanId = existingEnterprisePlan.Id, FeatureId = checkReviewLogsFeature.Id });
                if (changeControlRegisterFeature != null) context.Set<SubscriptionPlanFeature>().Add(new SubscriptionPlanFeature { SubscriptionPlanId = existingEnterprisePlan.Id, FeatureId = changeControlRegisterFeature.Id });
                if (monthlyProgressReviewFeature != null) context.Set<SubscriptionPlanFeature>().Add(new SubscriptionPlanFeature { SubscriptionPlanId = existingEnterprisePlan.Id, FeatureId = monthlyProgressReviewFeature.Id });
                if (quarterlyProgressReviewFeature != null) context.Set<SubscriptionPlanFeature>().Add(new SubscriptionPlanFeature { SubscriptionPlanId = existingEnterprisePlan.Id, FeatureId = quarterlyProgressReviewFeature.Id });
                if (weeklyDailyProgressReviewFeature != null) context.Set<SubscriptionPlanFeature>().Add(new SubscriptionPlanFeature { SubscriptionPlanId = existingEnterprisePlan.Id, FeatureId = weeklyDailyProgressReviewFeature.Id });
                if (milestoneTrackingFeature != null) context.Set<SubscriptionPlanFeature>().Add(new SubscriptionPlanFeature { SubscriptionPlanId = existingEnterprisePlan.Id, FeatureId = milestoneTrackingFeature.Id });
                if (budgetVsActualAnalysisFeature != null) context.Set<SubscriptionPlanFeature>().Add(new SubscriptionPlanFeature { SubscriptionPlanId = existingEnterprisePlan.Id, FeatureId = budgetVsActualAnalysisFeature.Id });
                if (manpowerPlanningFeature != null) context.Set<SubscriptionPlanFeature>().Add(new SubscriptionPlanFeature { SubscriptionPlanId = existingEnterprisePlan.Id, FeatureId = manpowerPlanningFeature.Id });
                if (apiIntegrationFeature != null) context.Set<SubscriptionPlanFeature>().Add(new SubscriptionPlanFeature { SubscriptionPlanId = existingEnterprisePlan.Id, FeatureId = apiIntegrationFeature.Id });
                if (tailoredUiUxFeature != null) context.Set<SubscriptionPlanFeature>().Add(new SubscriptionPlanFeature { SubscriptionPlanId = existingEnterprisePlan.Id, FeatureId = tailoredUiUxFeature.Id });
                if (basicExportPdfFeature != null) context.Set<SubscriptionPlanFeature>().Add(new SubscriptionPlanFeature { SubscriptionPlanId = existingEnterprisePlan.Id, FeatureId = basicExportPdfFeature.Id });
            }

            // One-Time License Plan Features (All Enterprise features)
            if (existingOneTimeLicensePlan != null)
            {
                if (wbsFeature != null) context.Set<SubscriptionPlanFeature>().Add(new SubscriptionPlanFeature { SubscriptionPlanId = existingOneTimeLicensePlan.Id, FeatureId = wbsFeature.Id });
                if (wbsVersion2Feature != null) context.Set<SubscriptionPlanFeature>().Add(new SubscriptionPlanFeature { SubscriptionPlanId = existingOneTimeLicensePlan.Id, FeatureId = wbsVersion2Feature.Id });
                if (ganttTimelineViewFeature != null) context.Set<SubscriptionPlanFeature>().Add(new SubscriptionPlanFeature { SubscriptionPlanId = existingOneTimeLicensePlan.Id, FeatureId = ganttTimelineViewFeature.Id });
                if (odcTableFeature != null) context.Set<SubscriptionPlanFeature>().Add(new SubscriptionPlanFeature { SubscriptionPlanId = existingOneTimeLicensePlan.Id, FeatureId = odcTableFeature.Id });
                if (jobStartFormFeature != null) context.Set<SubscriptionPlanFeature>().Add(new SubscriptionPlanFeature { SubscriptionPlanId = existingOneTimeLicensePlan.Id, FeatureId = jobStartFormFeature.Id });
                if (estimatedExpensesTableFeature != null) context.Set<SubscriptionPlanFeature>().Add(new SubscriptionPlanFeature { SubscriptionPlanId = existingOneTimeLicensePlan.Id, FeatureId = estimatedExpensesTableFeature.Id });
                if (inputRegisterFeature != null) context.Set<SubscriptionPlanFeature>().Add(new SubscriptionPlanFeature { SubscriptionPlanId = existingOneTimeLicensePlan.Id, FeatureId = inputRegisterFeature.Id });
                if (emailNotificationsFeature != null) context.Set<SubscriptionPlanFeature>().Add(new SubscriptionPlanFeature { SubscriptionPlanId = existingOneTimeLicensePlan.Id, FeatureId = emailNotificationsFeature.Id });
                if (checkReviewLogsFeature != null) context.Set<SubscriptionPlanFeature>().Add(new SubscriptionPlanFeature { SubscriptionPlanId = existingOneTimeLicensePlan.Id, FeatureId = checkReviewLogsFeature.Id });
                if (changeControlRegisterFeature != null) context.Set<SubscriptionPlanFeature>().Add(new SubscriptionPlanFeature { SubscriptionPlanId = existingOneTimeLicensePlan.Id, FeatureId = changeControlRegisterFeature.Id });
                if (monthlyProgressReviewFeature != null) context.Set<SubscriptionPlanFeature>().Add(new SubscriptionPlanFeature { SubscriptionPlanId = existingOneTimeLicensePlan.Id, FeatureId = monthlyProgressReviewFeature.Id });
                if (quarterlyProgressReviewFeature != null) context.Set<SubscriptionPlanFeature>().Add(new SubscriptionPlanFeature { SubscriptionPlanId = existingOneTimeLicensePlan.Id, FeatureId = quarterlyProgressReviewFeature.Id });
                if (weeklyDailyProgressReviewFeature != null) context.Set<SubscriptionPlanFeature>().Add(new SubscriptionPlanFeature { SubscriptionPlanId = existingOneTimeLicensePlan.Id, FeatureId = weeklyDailyProgressReviewFeature.Id });
                if (milestoneTrackingFeature != null) context.Set<SubscriptionPlanFeature>().Add(new SubscriptionPlanFeature { SubscriptionPlanId = existingOneTimeLicensePlan.Id, FeatureId = milestoneTrackingFeature.Id });
                if (budgetVsActualAnalysisFeature != null) context.Set<SubscriptionPlanFeature>().Add(new SubscriptionPlanFeature { SubscriptionPlanId = existingOneTimeLicensePlan.Id, FeatureId = budgetVsActualAnalysisFeature.Id });
                if (manpowerPlanningFeature != null) context.Set<SubscriptionPlanFeature>().Add(new SubscriptionPlanFeature { SubscriptionPlanId = existingOneTimeLicensePlan.Id, FeatureId = manpowerPlanningFeature.Id });
                if (apiIntegrationFeature != null) context.Set<SubscriptionPlanFeature>().Add(new SubscriptionPlanFeature { SubscriptionPlanId = existingOneTimeLicensePlan.Id, FeatureId = apiIntegrationFeature.Id });
                if (tailoredUiUxFeature != null) context.Set<SubscriptionPlanFeature>().Add(new SubscriptionPlanFeature { SubscriptionPlanId = existingOneTimeLicensePlan.Id, FeatureId = tailoredUiUxFeature.Id });
                if (basicExportPdfFeature != null) context.Set<SubscriptionPlanFeature>().Add(new SubscriptionPlanFeature { SubscriptionPlanId = existingOneTimeLicensePlan.Id, FeatureId = basicExportPdfFeature.Id });
            }

            await context.SaveChangesAsync();
            Console.WriteLine("SubscriptionPlan feature mappings reseeded successfully");
        }

        private static async Task SeedWBSOptionsAsync(ProjectManagementContext context)
        {
            // Check if WBSOptions table has data
            if (!await context.WBSOptions.AnyAsync())
            {
                Console.WriteLine("WBSOptions table is empty, inserting data...");

                var wbsOptions = new List<WBSOption>
                {
                    // Manpower Form Options (FormType 0)
                    new WBSOption { Id = 1, TenantId = 1, Value = "inception_report", Label = "Inception Report", Level = 1, ParentId = null, FormType = FormType.Manpower },
                    new WBSOption { Id = 2, TenantId = 1, Value = "feasibility_report", Label = "Feasibility Report", Level = 1, ParentId = null, FormType = FormType.Manpower },
                    new WBSOption { Id = 3, TenantId = 1, Value = "draft_detailed_project_report", Label = "Draft Detailed Project Report", Level = 1, ParentId = null, FormType = FormType.Manpower },
                    new WBSOption { Id = 4, TenantId = 1, Value = "detailed_project_report", Label = "Detailed Project Report", Level = 1, ParentId = null, FormType = FormType.Manpower },
                    new WBSOption { Id = 5, TenantId = 1, Value = "tendering_documents", Label = "Tendering Documents", Level = 1, ParentId = null, FormType = FormType.Manpower },
                    new WBSOption { Id = 6, TenantId = 1, Value = "construction_supervision", Label = "Construction Supervision", Level = 1, ParentId = null, FormType = FormType.Manpower },
                    new WBSOption { Id = 7, TenantId = 1, Value = "surveys", Label = "Surveys", Level = 2, ParentId = 1, FormType = FormType.Manpower },
                    new WBSOption { Id = 8, TenantId = 1, Value = "design", Label = "Design", Level = 2, ParentId = 1, FormType = FormType.Manpower },
                    new WBSOption { Id = 9, TenantId = 1, Value = "cost_estimation", Label = "Cost Estimation", Level = 2, ParentId = 1, FormType = FormType.Manpower },
                    new WBSOption { Id = 10, TenantId = 1, Value = "surveys", Label = "Surveys", Level = 2, ParentId = 2, FormType = FormType.Manpower },
                    new WBSOption { Id = 11, TenantId = 1, Value = "design", Label = "Design", Level = 2, ParentId = 2, FormType = FormType.Manpower },
                    new WBSOption { Id = 12, TenantId = 1, Value = "cost_estimation", Label = "Cost Estimation", Level = 2, ParentId = 2, FormType = FormType.Manpower },
                    new WBSOption { Id = 13, TenantId = 1, Value = "surveys", Label = "Surveys", Level = 2, ParentId = 3, FormType = FormType.Manpower },
                    new WBSOption { Id = 14, TenantId = 1, Value = "design", Label = "Design", Level = 2, ParentId = 3, FormType = FormType.Manpower },
                    new WBSOption { Id = 15, TenantId = 1, Value = "cost_estimation", Label = "Cost Estimation", Level = 2, ParentId = 3, FormType = FormType.Manpower },
                    new WBSOption { Id = 16, TenantId = 1, Value = "surveys", Label = "Surveys", Level = 2, ParentId = 4, FormType = FormType.Manpower },
                    new WBSOption { Id = 17, TenantId = 1, Value = "design", Label = "Design", Level = 2, ParentId = 4, FormType = FormType.Manpower },
                    new WBSOption { Id = 18, TenantId = 1, Value = "cost_estimation", Label = "Cost Estimation", Level = 2, ParentId = 4, FormType = FormType.Manpower },
                    new WBSOption { Id = 19, TenantId = 1, Value = "surveys", Label = "Surveys", Level = 2, ParentId = 5, FormType = FormType.Manpower },
                    new WBSOption { Id = 20, TenantId = 1, Value = "design", Label = "Design", Level = 2, ParentId = 5, FormType = FormType.Manpower },
                    new WBSOption { Id = 21, TenantId = 1, Value = "cost_estimation", Label = "Cost Estimation", Level = 2, ParentId = 5, FormType = FormType.Manpower },
                    new WBSOption { Id = 22, TenantId = 1, Value = "surveys", Label = "Surveys", Level = 2, ParentId = 6, FormType = FormType.Manpower },
                    new WBSOption { Id = 23, TenantId = 1, Value = "design", Label = "Design", Level = 2, ParentId = 6, FormType = FormType.Manpower },
                    new WBSOption { Id = 24, TenantId = 1, Value = "cost_estimation", Label = "Cost Estimation", Level = 2, ParentId = 6, FormType = FormType.Manpower },
                    new WBSOption { Id = 25, TenantId = 1, Value = "topographical_survey", Label = "Topographical Survey", Level = 3, ParentId = 7, FormType = FormType.Manpower },
                    new WBSOption { Id = 26, TenantId = 1, Value = "soil_investigation", Label = "Soil Investigation", Level = 3, ParentId = 7, FormType = FormType.Manpower },
                    new WBSOption { Id = 27, TenantId = 1, Value = "social_impact_assessment", Label = "Social Impact Assessment", Level = 3, ParentId = 7, FormType = FormType.Manpower },
                    new WBSOption { Id = 28, TenantId = 1, Value = "environmental_assessment", Label = "Environmental Assessment", Level = 3, ParentId = 7, FormType = FormType.Manpower },
                    new WBSOption { Id = 29, TenantId = 1, Value = "flow_measurement", Label = "Flow Measurement", Level = 3, ParentId = 7, FormType = FormType.Manpower },
                    new WBSOption { Id = 30, TenantId = 1, Value = "water_quality_measurement", Label = "Water Quality Measurement", Level = 3, ParentId = 7, FormType = FormType.Manpower },
                    new WBSOption { Id = 31, TenantId = 1, Value = "process_design", Label = "Process Design", Level = 3, ParentId = 8, FormType = FormType.Manpower },
                    new WBSOption { Id = 32, TenantId = 1, Value = "mechanical_design", Label = "Mechanical Design", Level = 3, ParentId = 8, FormType = FormType.Manpower },
                    new WBSOption { Id = 33, TenantId = 1, Value = "structural_design", Label = "Structural Design", Level = 3, ParentId = 8, FormType = FormType.Manpower },
                    new WBSOption { Id = 34, TenantId = 1, Value = "electrical_design", Label = "Electrical Design", Level = 3, ParentId = 8, FormType = FormType.Manpower },
                    new WBSOption { Id = 35, TenantId = 1, Value = "ica_design", Label = "ICA Design", Level = 3, ParentId = 8, FormType = FormType.Manpower },
                    new WBSOption { Id = 36, TenantId = 1, Value = "cost_estimation", Label = "Cost Estimation", Level = 3, ParentId = 9, FormType = FormType.Manpower },
                    new WBSOption { Id = 37, TenantId = 1, Value = "topographical_survey", Label = "Topographical Survey", Level = 3, ParentId = 10, FormType = FormType.Manpower },
                    new WBSOption { Id = 38, TenantId = 1, Value = "soil_investigation", Label = "Soil Investigation", Level = 3, ParentId = 10, FormType = FormType.Manpower },
                    new WBSOption { Id = 39, TenantId = 1, Value = "social_impact_assessment", Label = "Social Impact Assessment", Level = 3, ParentId = 10, FormType = FormType.Manpower },
                    new WBSOption { Id = 40, TenantId = 1, Value = "environmental_assessment", Label = "Environmental Assessment", Level = 3, ParentId = 10, FormType = FormType.Manpower },
                    new WBSOption { Id = 41, TenantId = 1, Value = "flow_measurement", Label = "Flow Measurement", Level = 3, ParentId = 10, FormType = FormType.Manpower },
                    new WBSOption { Id = 42, TenantId = 1, Value = "water_quality_measurement", Label = "Water Quality Measurement", Level = 3, ParentId = 10, FormType = FormType.Manpower },
                    new WBSOption { Id = 43, TenantId = 1, Value = "process_design", Label = "Process Design", Level = 3, ParentId = 11, FormType = FormType.Manpower },
                    new WBSOption { Id = 44, TenantId = 1, Value = "mechanical_design", Label = "Mechanical Design", Level = 3, ParentId = 11, FormType = FormType.Manpower },
                    new WBSOption { Id = 45, TenantId = 1, Value = "structural_design", Label = "Structural Design", Level = 3, ParentId = 11, FormType = FormType.Manpower },
                    new WBSOption { Id = 46, TenantId = 1, Value = "electrical_design", Label = "Electrical Design", Level = 3, ParentId = 11, FormType = FormType.Manpower },
                    new WBSOption { Id = 47, TenantId = 1, Value = "ica_design", Label = "ICA Design", Level = 3, ParentId = 11, FormType = FormType.Manpower },
                    new WBSOption { Id = 48, TenantId = 1, Value = "cost_estimation", Label = "Cost Estimation", Level = 3, ParentId = 12, FormType = FormType.Manpower },
                    new WBSOption { Id = 49, TenantId = 1, Value = "topographical_survey", Label = "Topographical Survey", Level = 3, ParentId = 13, FormType = FormType.Manpower },
                    new WBSOption { Id = 50, TenantId = 1, Value = "soil_investigation", Label = "Soil Investigation", Level = 3, ParentId = 13, FormType = FormType.Manpower },
                    new WBSOption { Id = 51, TenantId = 1, Value = "social_impact_assessment", Label = "Social Impact Assessment", Level = 3, ParentId = 13, FormType = FormType.Manpower },
                    new WBSOption { Id = 52, TenantId = 1, Value = "environmental_assessment", Label = "Environmental Assessment", Level = 3, ParentId = 13, FormType = FormType.Manpower },
                    new WBSOption { Id = 53, TenantId = 1, Value = "flow_measurement", Label = "Flow Measurement", Level = 3, ParentId = 13, FormType = FormType.Manpower },
                    new WBSOption { Id = 54, TenantId = 1, Value = "water_quality_measurement", Label = "Water Quality Measurement", Level = 3, ParentId = 13, FormType = FormType.Manpower },
                    new WBSOption { Id = 55, TenantId = 1, Value = "process_design", Label = "Process Design", Level = 3, ParentId = 14, FormType = FormType.Manpower },
                    new WBSOption { Id = 56, TenantId = 1, Value = "mechanical_design", Label = "Mechanical Design", Level = 3, ParentId = 14, FormType = FormType.Manpower },
                    new WBSOption { Id = 57, TenantId = 1, Value = "structural_design", Label = "Structural Design", Level = 3, ParentId = 14, FormType = FormType.Manpower },
                    new WBSOption { Id = 58, TenantId = 1, Value = "electrical_design", Label = "Electrical Design", Level = 3, ParentId = 14, FormType = FormType.Manpower },
                    new WBSOption { Id = 59, TenantId = 1, Value = "ica_design", Label = "ICA Design", Level = 3, ParentId = 14, FormType = FormType.Manpower },
                    new WBSOption { Id = 60, TenantId = 1, Value = "cost_estimation", Label = "Cost Estimation", Level = 3, ParentId = 15, FormType = FormType.Manpower },
                    new WBSOption { Id = 61, TenantId = 1, Value = "topographical_survey", Label = "Topographical Survey", Level = 3, ParentId = 16, FormType = FormType.Manpower },
                    new WBSOption { Id = 62, TenantId = 1, Value = "soil_investigation", Label = "Soil Investigation", Level = 3, ParentId = 16, FormType = FormType.Manpower },
                    new WBSOption { Id = 63, TenantId = 1, Value = "social_impact_assessment", Label = "Social Impact Assessment", Level = 3, ParentId = 16, FormType = FormType.Manpower },
                    new WBSOption { Id = 64, TenantId = 1, Value = "environmental_assessment", Label = "Environmental Assessment", Level = 3, ParentId = 16, FormType = FormType.Manpower },
                    new WBSOption { Id = 65, TenantId = 1, Value = "flow_measurement", Label = "Flow Measurement", Level = 3, ParentId = 16, FormType = FormType.Manpower },
                    new WBSOption { Id = 66, TenantId = 1, Value = "water_quality_measurement", Label = "Water Quality Measurement", Level = 3, ParentId = 16, FormType = FormType.Manpower },
                    new WBSOption { Id = 67, TenantId = 1, Value = "process_design", Label = "Process Design", Level = 3, ParentId = 17, FormType = FormType.Manpower },
                    new WBSOption { Id = 68, TenantId = 1, Value = "mechanical_design", Label = "Mechanical Design", Level = 3, ParentId = 17, FormType = FormType.Manpower },
                    new WBSOption { Id = 69, TenantId = 1, Value = "structural_design", Label = "Structural Design", Level = 3, ParentId = 17, FormType = FormType.Manpower },
                    new WBSOption { Id = 70, TenantId = 1, Value = "electrical_design", Label = "Electrical Design", Level = 3, ParentId = 17, FormType = FormType.Manpower },
                    new WBSOption { Id = 71, TenantId = 1, Value = "ica_design", Label = "ICA Design", Level = 3, ParentId = 17, FormType = FormType.Manpower },
                    new WBSOption { Id = 72, TenantId = 1, Value = "cost_estimation", Label = "Cost Estimation", Level = 3, ParentId = 18, FormType = FormType.Manpower },
                    new WBSOption { Id = 73, TenantId = 1, Value = "topographical_survey", Label = "Topographical Survey", Level = 3, ParentId = 19, FormType = FormType.Manpower },
                    new WBSOption { Id = 74, TenantId = 1, Value = "soil_investigation", Label = "Soil Investigation", Level = 3, ParentId = 19, FormType = FormType.Manpower },
                    new WBSOption { Id = 75, TenantId = 1, Value = "social_impact_assessment", Label = "Social Impact Assessment", Level = 3, ParentId = 19, FormType = FormType.Manpower },
                    new WBSOption { Id = 76, TenantId = 1, Value = "environmental_assessment", Label = "Environmental Assessment", Level = 3, ParentId = 19, FormType = FormType.Manpower },
                    new WBSOption { Id = 77, TenantId = 1, Value = "flow_measurement", Label = "Flow Measurement", Level = 3, ParentId = 19, FormType = FormType.Manpower },
                    new WBSOption { Id = 78, TenantId = 1, Value = "water_quality_measurement", Label = "Water Quality Measurement", Level = 3, ParentId = 19, FormType = FormType.Manpower },
                    new WBSOption { Id = 79, TenantId = 1, Value = "process_design", Label = "Process Design", Level = 3, ParentId = 20, FormType = FormType.Manpower },
                    new WBSOption { Id = 80, TenantId = 1, Value = "mechanical_design", Label = "Mechanical Design", Level = 3, ParentId = 20, FormType = FormType.Manpower },
                    new WBSOption { Id = 81, TenantId = 1, Value = "structural_design", Label = "Structural Design", Level = 3, ParentId = 20, FormType = FormType.Manpower },
                    new WBSOption { Id = 82, TenantId = 1, Value = "electrical_design", Label = "Electrical Design", Level = 3, ParentId = 20, FormType = FormType.Manpower },
                    new WBSOption { Id = 83, TenantId = 1, Value = "ica_design", Label = "ICA Design", Level = 3, ParentId = 20, FormType = FormType.Manpower },
                    new WBSOption { Id = 84, TenantId = 1, Value = "cost_estimation", Label = "Cost Estimation", Level = 3, ParentId = 21, FormType = FormType.Manpower },
                    new WBSOption { Id = 85, TenantId = 1, Value = "topographical_survey", Label = "Topographical Survey", Level = 3, ParentId = 22, FormType = FormType.Manpower },
                    new WBSOption { Id = 86, TenantId = 1, Value = "soil_investigation", Label = "Soil Investigation", Level = 3, ParentId = 22, FormType = FormType.Manpower },
                    new WBSOption { Id = 87, TenantId = 1, Value = "social_impact_assessment", Label = "Social Impact Assessment", Level = 3, ParentId = 22, FormType = FormType.Manpower },
                    new WBSOption { Id = 88, TenantId = 1, Value = "environmental_assessment", Label = "Environmental Assessment", Level = 3, ParentId = 22, FormType = FormType.Manpower },
                    new WBSOption { Id = 89, TenantId = 1, Value = "flow_measurement", Label = "Flow Measurement", Level = 3, ParentId = 22, FormType = FormType.Manpower },
                    new WBSOption { Id = 90, TenantId = 1, Value = "water_quality_measurement", Label = "Water Quality Measurement", Level = 3, ParentId = 22, FormType = FormType.Manpower },
                    new WBSOption { Id = 91, TenantId = 1, Value = "process_design", Label = "Process Design", Level = 3, ParentId = 23, FormType = FormType.Manpower },
                    new WBSOption { Id = 92, TenantId = 1, Value = "mechanical_design", Label = "Mechanical Design", Level = 3, ParentId = 23, FormType = FormType.Manpower },
                    new WBSOption { Id = 93, TenantId = 1, Value = "structural_design", Label = "Structural Design", Level = 3, ParentId = 23, FormType = FormType.Manpower },
                    new WBSOption { Id = 94, TenantId = 1, Value = "electrical_design", Label = "Electrical Design", Level = 3, ParentId = 23, FormType = FormType.Manpower },
                    new WBSOption { Id = 95, TenantId = 1, Value = "ica_design", Label = "ICA Design", Level = 3, ParentId = 23, FormType = FormType.Manpower },
                    new WBSOption { Id = 96, TenantId = 1, Value = "cost_estimation", Label = "Cost Estimation", Level = 3, ParentId = 24, FormType = FormType.Manpower },

                    // ODC Form Options (FormType 1)
                    new WBSOption { Id = 97, TenantId = 1, Value = "general_odcs", Label = "General ODCS", Level = 1, ParentId = null, FormType = FormType.ODC },
                    new WBSOption { Id = 98, TenantId = 1, Value = "odcs_feasibility_report", Label = "ODCs Feasibility Report", Level = 1, ParentId = null, FormType = FormType.ODC },
                    new WBSOption { Id = 99, TenantId = 1, Value = "odcs_draft_dpr", Label = "ODCS Draft DPR", Level = 1, ParentId = null, FormType = FormType.ODC },
                    new WBSOption { Id = 100, TenantId = 1, Value = "travel", Label = "Travel", Level = 2, ParentId = 97, FormType = FormType.ODC },
                    new WBSOption { Id = 101, TenantId = 1, Value = "subsistence", Label = "Subsistence", Level = 2, ParentId = 97, FormType = FormType.ODC },
                    new WBSOption { Id = 102, TenantId = 1, Value = "local_conveyance", Label = "Local Conveyance", Level = 2, ParentId = 97, FormType = FormType.ODC },
                    new WBSOption { Id = 103, TenantId = 1, Value = "communications", Label = "Communications", Level = 2, ParentId = 97, FormType = FormType.ODC },
                    new WBSOption { Id = 104, TenantId = 1, Value = "office", Label = "Office", Level = 2, ParentId = 97, FormType = FormType.ODC },
                    new WBSOption { Id = 105, TenantId = 1, Value = "stationery_and_printing", Label = "Stationery and Printing", Level = 2, ParentId = 97, FormType = FormType.ODC },
                    new WBSOption { Id = 106, TenantId = 1, Value = "travel_1", Label = "Travel 1", Level = 3, ParentId = 100, FormType = FormType.ODC },
                    new WBSOption { Id = 107, TenantId = 1, Value = "travel_2", Label = "Travel 2", Level = 3, ParentId = 100, FormType = FormType.ODC },
                    new WBSOption { Id = 108, TenantId = 1, Value = "travel_3", Label = "Travel 3", Level = 3, ParentId = 100, FormType = FormType.ODC },
                    new WBSOption { Id = 109, TenantId = 1, Value = "travel_4", Label = "Travel 4", Level = 3, ParentId = 100, FormType = FormType.ODC },
                    new WBSOption { Id = 110, TenantId = 1, Value = "s1", Label = "S1", Level = 3, ParentId = 101, FormType = FormType.ODC },
                    new WBSOption { Id = 111, TenantId = 1, Value = "s2", Label = "S2", Level = 3, ParentId = 101, FormType = FormType.ODC },
                    new WBSOption { Id = 112, TenantId = 1, Value = "s3", Label = "S3", Level = 3, ParentId = 101, FormType = FormType.ODC },
                    new WBSOption { Id = 113, TenantId = 1, Value = "car_1", Label = "Car 1", Level = 3, ParentId = 102, FormType = FormType.ODC },
                    new WBSOption { Id = 114, TenantId = 1, Value = "cell_phones", Label = "Cell Phones", Level = 3, ParentId = 103, FormType = FormType.ODC },
                    new WBSOption { Id = 115, TenantId = 1, Value = "internet", Label = "Internet", Level = 3, ParentId = 103, FormType = FormType.ODC },
                    new WBSOption { Id = 116, TenantId = 1, Value = "office_1", Label = "Office 1", Level = 3, ParentId = 104, FormType = FormType.ODC },
                    new WBSOption { Id = 117, TenantId = 1, Value = "printing", Label = "Printing", Level = 3, ParentId = 105, FormType = FormType.ODC },
                    new WBSOption { Id = 118, TenantId = 1, Value = "photocopy", Label = "Photocopy", Level = 3, ParentId = 105, FormType = FormType.ODC },
                    new WBSOption { Id = 119, TenantId = 1, Value = "topographical_surveys", Label = "Topographical Surveys", Level = 2, ParentId = 98, FormType = FormType.ODC },
                    new WBSOption { Id = 120, TenantId = 1, Value = "alignment_survey", Label = "Alignment Survey", Level = 3, ParentId = 119, FormType = FormType.ODC },
                    new WBSOption { Id = 121, TenantId = 1, Value = "plan_table_survey", Label = "Plan Table Survey", Level = 3, ParentId = 119, FormType = FormType.ODC },
                    new WBSOption { Id = 122, TenantId = 1, Value = "geotechnical_surveys", Label = "Geotechnical Surveys", Level = 2, ParentId = 99, FormType = FormType.ODC },
                    new WBSOption { Id = 123, TenantId = 1, Value = "water_quality_survey", Label = "Water Quality Survey", Level = 2, ParentId = 99, FormType = FormType.ODC },
                    new WBSOption { Id = 124, TenantId = 1, Value = "flow_measurement", Label = "Flow Measurement", Level = 2, ParentId = 99, FormType = FormType.ODC },
                    new WBSOption { Id = 125, TenantId = 1, Value = "part_1", Label = "Part 1", Level = 3, ParentId = 122, FormType = FormType.ODC },
                    new WBSOption { Id = 126, TenantId = 1, Value = "part_2", Label = "Part 2", Level = 3, ParentId = 122, FormType = FormType.ODC },
                    new WBSOption { Id = 127, TenantId = 1, Value = "part_3", Label = "Part 3", Level = 3, ParentId = 122, FormType = FormType.ODC },
                    new WBSOption { Id = 128, TenantId = 1, Value = "part_4", Label = "Part 4", Level = 3, ParentId = 122, FormType = FormType.ODC },
                    new WBSOption { Id = 129, TenantId = 1, Value = "wq1", Label = "WQ1", Level = 3, ParentId = 123, FormType = FormType.ODC },
                    new WBSOption { Id = 130, TenantId = 1, Value = "fm1", Label = "Fm1", Level = 3, ParentId = 124, FormType = FormType.ODC }
                };

                try
                {
                    var strategy = context.Database.CreateExecutionStrategy();
                    await strategy.ExecuteAsync(async () =>
                    {
                        await using var transaction = await context.Database.BeginTransactionAsync();
                        try
                        {
                            await context.Database.ExecuteSqlRawAsync("SET IDENTITY_INSERT dbo.WBSOptions ON");
                            await context.WBSOptions.AddRangeAsync(wbsOptions);
                            await context.SaveChangesAsync();
                            await context.Database.ExecuteSqlRawAsync("SET IDENTITY_INSERT dbo.WBSOptions OFF");
                            await transaction.CommitAsync();
                        }
                        catch (Exception ex)
                        {
                            await transaction.RollbackAsync();
                            Console.WriteLine($"Error: Could not insert seed WBSOptions due: {ex.Message}");
                            //throw;
                        }
                    });
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Warning: Could not seed WBSOptions due to identity constraint: {ex.Message}");
                    Console.WriteLine("The backend will continue to run. You can manually populate WBSOptions later.");
                }
                Console.WriteLine("WBSOptions data inserted successfully");
            }
            else
            {
                Console.WriteLine("WBSOptions table already has data, skipping insert");
            }
        }

        private static async Task SeedScoringTablesAsync(ProjectManagementContext context)
        {
            // Seed OpportunityStatuses
            if (!context.OpportunityStatuses.Any())
            {
                Console.WriteLine("OpportunityStatuses table is empty, inserting data...");
                var opportunityStatuses = new List<OpportunityStatus>
                {
                    new OpportunityStatus { Status = "Initial" },
                    new OpportunityStatus { Status = "Sent for Review" },
                    new OpportunityStatus { Status = "Review Changes" },
                    new OpportunityStatus { Status = "Sent for Approval" },
                    new OpportunityStatus { Status = "Approval Changes" },
                    new OpportunityStatus { Status = "Approved" }
                };
                context.OpportunityStatuses.AddRange(opportunityStatuses);
                await context.SaveChangesAsync();
                Console.WriteLine("OpportunityStatuses data inserted successfully");
            }
            else
            {
                Console.WriteLine("OpportunityStatuses table already has data, skipping insert");
            }

            // Seed ScoringCriteria
            if (!context.ScoringCriteria.Any())
            {
                Console.WriteLine("ScoringCriteria table is empty, inserting data...");
                var scoringCriteria = new List<ScoringCriteria>
                {
                    new ScoringCriteria { Label = "marketingPlan", ByWhom = "", ByDate = "", Comments = "", Score = 0, ShowComments = false },
                    new ScoringCriteria { Label = "clientRelationship", ByWhom = "", ByDate = "", Comments = "", Score = 0, ShowComments = false },
                    new ScoringCriteria { Label = "projectKnowledge", ByWhom = "", ByDate = "", Comments = "", Score = 0, ShowComments = false },
                    new ScoringCriteria { Label = "technicalEligibility", ByWhom = "", ByDate = "", Comments = "", Score = 0, ShowComments = false },
                    new ScoringCriteria { Label = "financialEligibility", ByWhom = "", ByDate = "", Comments = "", Score = 0, ShowComments = false },
                    new ScoringCriteria { Label = "keyStaffAvailability", ByWhom = "", ByDate = "", Comments = "", Score = 0, ShowComments = false },
                    new ScoringCriteria { Label = "projectCompetition", ByWhom = "", ByDate = "", Comments = "", Score = 0, ShowComments = false },
                    new ScoringCriteria { Label = "competitionPosition", ByWhom = "", ByDate = "", Comments = "", Score = 0, ShowComments = false },
                    new ScoringCriteria { Label = "futureWorkPotential", ByWhom = "", ByDate = "", Comments = "", Score = 0, ShowComments = false },
                    new ScoringCriteria { Label = "projectProfitability", ByWhom = "", ByDate = "", Comments = "", Score = 0, ShowComments = false },
                    new ScoringCriteria { Label = "projectSchedule", ByWhom = "", ByDate = "", Comments = "", Score = 0, ShowComments = false },
                    new ScoringCriteria { Label = "bidTimeAndCosts", ByWhom = "", ByDate = "", Comments = "", Score = 0, ShowComments = false }
                };
                context.ScoringCriteria.AddRange(scoringCriteria);
                await context.SaveChangesAsync();
                Console.WriteLine("ScoringCriteria data inserted successfully");
            }
            else
            {
                Console.WriteLine("ScoringCriteria table already has data, skipping insert");
            }

            // Seed ScoreRange
            if (!context.ScoreRange.Any())
            {
                Console.WriteLine("ScoreRange table is empty, inserting data...");
                var scoreRanges = new List<ScoreRange>
                {
                    new ScoreRange { value = 10, label = "10 - Excellent", range = "high" },
                    new ScoreRange { value = 9, label = "9 - Excellent", range = "high" },
                    new ScoreRange { value = 8, label = "8 - Excellent", range = "high" },
                    new ScoreRange { value = 7, label = "7 - Good", range = "medium" },
                    new ScoreRange { value = 6, label = "6 - Good", range = "medium" },
                    new ScoreRange { value = 5, label = "5 - Good", range = "medium" },
                    new ScoreRange { value = 4, label = "4 - Poor", range = "low" },
                    new ScoreRange { value = 3, label = "3 - Poor", range = "low" },
                    new ScoreRange { value = 2, label = "2 - Poor", range = "low" },
                    new ScoreRange { value = 1, label = "1 - Poor", range = "low" }
                };
                context.ScoreRange.AddRange(scoreRanges);
                await context.SaveChangesAsync();
                Console.WriteLine("ScoreRange data inserted successfully");
            }
            else
            {
                Console.WriteLine("ScoreRange table already has data, skipping insert");
            }

            // Seed ScoringDescription
            if (!context.ScoringDescription.Any())
            {
                Console.WriteLine("ScoringDescription table is empty, inserting data...");
                var scoringDescriptions = new List<ScoringDescriptions>
                {
                    new ScoringDescriptions { Label = "marketingPlan" },
                    new ScoringDescriptions { Label = "clientRelationship" },
                    new ScoringDescriptions { Label = "projectKnowledge" },
                    new ScoringDescriptions { Label = "technicalEligibility" },
                    new ScoringDescriptions { Label = "financialEligibility" },
                    new ScoringDescriptions { Label = "keyStaffAvailability" },
                    new ScoringDescriptions { Label = "projectCompetition" },
                    new ScoringDescriptions { Label = "competitionPosition" },
                    new ScoringDescriptions { Label = "futureWorkPotential" },
                    new ScoringDescriptions { Label = "projectProfitability" },
                    new ScoringDescriptions { Label = "projectSchedule" },
                    new ScoringDescriptions { Label = "bidTimeAndCosts" }
                };
                context.ScoringDescription.AddRange(scoringDescriptions);
                await context.SaveChangesAsync();
                Console.WriteLine("ScoringDescription data inserted successfully");
            }
            else
            {
                Console.WriteLine("ScoringDescription table already has data, skipping insert");
            }

            // Seed ScoringDescriptionSummarry (simplified approach)
            if (!context.ScoringDescriptionSummarry.Any())
            {
                Console.WriteLine("ScoringDescriptionSummarry table is empty, inserting data...");
                var scoringDescriptionSummaries = new List<ScoringDescriptionSummarry>
                {
                    new ScoringDescriptionSummarry { ScoringDescriptionID = 1, High = "Fits well with marketing strategy", Medium = "Fits somewhat into the marketing strategy", Low = "Does not fit with marketing strategy" },
                    new ScoringDescriptionSummarry { ScoringDescriptionID = 2, High = "Excellent relationships, no past problem projects", Medium = "Fair/good relationships, some project problems", Low = "Strained relationship(s), problem project(s), selectability questionable" },
                    new ScoringDescriptionSummarry { ScoringDescriptionID = 3, High = "Strategic project, excellent knowledge of project development", Medium = "Known about project, but some knowledge of project development", Low = "Knew nothing about project prior to receipt of RFQ/RFP" },
                    new ScoringDescriptionSummarry { ScoringDescriptionID = 4, High = "Meets all criteria on its own", Medium = "Need of JV or some support to meet the criteria", Low = "Does not meet qualification criteria" },
                    new ScoringDescriptionSummarry { ScoringDescriptionID = 5, High = "Meets all criteria on its own", Medium = "Need of JV or some support to meet the criteria", Low = "Does not meet qualification criteria" },
                    new ScoringDescriptionSummarry { ScoringDescriptionID = 6, High = "All competent key staff available", Medium = "Most competent key staff available but some outsourcing required", Low = "Major outsourcing required" },
                    new ScoringDescriptionSummarry { ScoringDescriptionID = 7, High = "NJS has inside track, and competition is manageable", Medium = "NJS faces formidable competition, and have limited intelligence on it", Low = "Project appears to be wired for competition" },
                    new ScoringDescriptionSummarry { ScoringDescriptionID = 8, High = "NJS qualifications are technically superior", Medium = "Qualifications are equivalent to competition, or we may have a slight edge", Low = "NJS qualifications are lower to the competition" },
                    new ScoringDescriptionSummarry { ScoringDescriptionID = 9, High = "Project will lead to future work", Medium = "Possible future work", Low = "One-time project, no future work" },
                    new ScoringDescriptionSummarry { ScoringDescriptionID = 10, High = "Good profit potential", Medium = "Competitive pricing, Moderate potential profit", Low = "Risky and may lead to little/no profit" },
                    new ScoringDescriptionSummarry { ScoringDescriptionID = 11, High = "More than adequate, project will not adversely impact other projects", Medium = "Adequate, other projects may be adversely impacted", Low = "Not adequate, other projects will be adversely impacted" },
                    new ScoringDescriptionSummarry { ScoringDescriptionID = 12, High = "Favorable", Medium = "Reasonable", Low = "Constrained" }
                };
                context.ScoringDescriptionSummarry.AddRange(scoringDescriptionSummaries);
                await context.SaveChangesAsync();
                Console.WriteLine("ScoringDescriptionSummarry data inserted successfully");
            }
            else
            {
                Console.WriteLine("ScoringDescriptionSummarry table already has data, skipping insert");
            }

            // Seed PMWorkflowStatuses
            if (!context.PMWorkflowStatuses.Any())
            {
                Console.WriteLine("PMWorkflowStatuses table is empty, inserting data...");
                var pmWorkflowStatuses = new List<PMWorkflowStatus>
                {
                    new PMWorkflowStatus { Status = "Initial" },
                    new PMWorkflowStatus { Status = "Sent for Review" },
                    new PMWorkflowStatus { Status = "Review Changes" },
                    new PMWorkflowStatus { Status = "Sent for Approval" },
                    new PMWorkflowStatus { Status = "Approval Changes" },
                    new PMWorkflowStatus { Status = "Approved" }
                };
                context.PMWorkflowStatuses.AddRange(pmWorkflowStatuses);
                await context.SaveChangesAsync();
                Console.WriteLine("PMWorkflowStatuses data inserted successfully");
            }
            else
            {
                Console.WriteLine("PMWorkflowStatuses table already has data, skipping insert");
            }
        }
    }
}

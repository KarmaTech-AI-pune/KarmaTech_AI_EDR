using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using NJS.Domain.Database;
using NJS.Domain.Entities;
using NJS.Domain.Enums; // Add import for WBSTaskLevel
using System;
using System.Collections.Generic;
using System.Linq;

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

                // Seed WBSOptions if they don't exist
                await SeedWBSOptionsAsync(context);
            }
            catch (Exception)
            {
                throw;
            }
        }

        private static async Task SeedWBSOptionsAsync(ProjectManagementContext context)
        {
            // Check if WBSOptions table has data
            if (!context.WBSOptions.Any())
            {
                Console.WriteLine("WBSOptions table is empty, inserting data...");

                // Insert Level 1 options for Manpower Form
                var manpowerLevel1Options = new List<WBSOption>
                {
                    new WBSOption { Value = "inception_report", Label = "Inception Report", Level = 1, ParentValue = null, FormType = FormType.Manpower },
                    new WBSOption { Value = "feasibility_report", Label = "Feasibility Report", Level = 1, ParentValue = null, FormType = FormType.Manpower },
                    new WBSOption { Value = "draft_detailed_project_report", Label = "Draft Detailed Project Report", Level = 1, ParentValue = null, FormType = FormType.Manpower },
                    new WBSOption { Value = "detailed_project_report", Label = "Detailed Project Report", Level = 1, ParentValue = null, FormType = FormType.Manpower },
                    new WBSOption { Value = "tendering_documents", Label = "Tendering Documents", Level = 1, ParentValue = null, FormType = FormType.Manpower },
                    new WBSOption { Value = "construction_supervision", Label = "Construction Supervision", Level = 1, ParentValue = null, FormType = FormType.Manpower }
                };
                context.WBSOptions.AddRange(manpowerLevel1Options);

                // Insert Level 2 options for Manpower Form
                var manpowerLevel2Options = new List<WBSOption>
                {
                    new WBSOption { Value = "surveys", Label = "Surveys", Level = 2, ParentValue = null, FormType = FormType.Manpower },
                    new WBSOption { Value = "design", Label = "Design", Level = 2, ParentValue = null, FormType = FormType.Manpower },
                    new WBSOption { Value = "cost_estimation", Label = "Cost Estimation", Level = 2, ParentValue = null, FormType = FormType.Manpower }
                };
                context.WBSOptions.AddRange(manpowerLevel2Options);

                // Insert Level 3 options for 'surveys' in Manpower Form
                var surveysLevel3Options = new List<WBSOption>
                {
                    new WBSOption { Value = "topographical_survey", Label = "Topographical Survey", Level = 3, ParentValue = "surveys", FormType = FormType.Manpower },
                    new WBSOption { Value = "soil_investigation", Label = "Soil Investigation", Level = 3, ParentValue = "surveys", FormType = FormType.Manpower },
                    new WBSOption { Value = "social_impact_assessment", Label = "Social Impact Assessment", Level = 3, ParentValue = "surveys", FormType = FormType.Manpower },
                    new WBSOption { Value = "environmental_assessment", Label = "Environmental Assessment", Level = 3, ParentValue = "surveys", FormType = FormType.Manpower },
                    new WBSOption { Value = "flow_measurement", Label = "Flow Measurement", Level = 3, ParentValue = "surveys", FormType = FormType.Manpower },
                    new WBSOption { Value = "water_quality_measurement", Label = "Water Quality Measurement", Level = 3, ParentValue = "surveys", FormType = FormType.Manpower }
                };
                context.WBSOptions.AddRange(surveysLevel3Options);

                // Insert Level 3 options for 'design' in Manpower Form
                var designLevel3Options = new List<WBSOption>
                {
                    new WBSOption { Value = "process_design", Label = "Process Design", Level = 3, ParentValue = "design", FormType = FormType.Manpower },
                    new WBSOption { Value = "mechanical_design", Label = "Mechanical Design", Level = 3, ParentValue = "design", FormType = FormType.Manpower },
                    new WBSOption { Value = "structural_design", Label = "Structural Design", Level = 3, ParentValue = "design", FormType = FormType.Manpower },
                    new WBSOption { Value = "electrical_design", Label = "Electrical Design", Level = 3, ParentValue = "design", FormType = FormType.Manpower },
                    new WBSOption { Value = "ica_design", Label = "ICA Design", Level = 3, ParentValue = "design", FormType = FormType.Manpower }
                };
                context.WBSOptions.AddRange(designLevel3Options);

                // Insert Level 3 options for 'cost_estimation' in Manpower Form
                var costEstimationLevel3Options = new List<WBSOption>
                {
                    new WBSOption { Value = "cost_estimation", Label = "Cost Estimation", Level = 3, ParentValue = "cost_estimation", FormType = FormType.Manpower }
                };
                context.WBSOptions.AddRange(costEstimationLevel3Options);

                // Insert Level 1 options for ODC Form
                var odcLevel1Options = new List<WBSOption>
                {
                    new WBSOption { Value = "general_odcs", Label = "General ODCS", Level = 1, ParentValue = null, FormType = FormType.ODC },
                    new WBSOption { Value = "odcs_feasibility_report", Label = "ODCs Feasibility Report", Level = 1, ParentValue = null, FormType = FormType.ODC },
                    new WBSOption { Value = "odcs_draft_dpr", Label = "ODCS Draft DPR", Level = 1, ParentValue = null, FormType = FormType.ODC }
                };
                context.WBSOptions.AddRange(odcLevel1Options);

                // Insert Level 2 options for ODC Form Level 1 'General ODCS'
                var generalOdcsLevel2Options = new List<WBSOption>
                {
                    new WBSOption { Value = "travel", Label = "Travel", Level = 2, ParentValue = "general_odcs", FormType = FormType.ODC },
                    new WBSOption { Value = "subsistence", Label = "Subsistence", Level = 2, ParentValue = "general_odcs", FormType = FormType.ODC },
                    new WBSOption { Value = "local_conveyance", Label = "Local conveyance", Level = 2, ParentValue = "general_odcs", FormType = FormType.ODC },
                    new WBSOption { Value = "communications", Label = "Communications", Level = 2, ParentValue = "general_odcs", FormType = FormType.ODC },
                    new WBSOption { Value = "office", Label = "office", Level = 2, ParentValue = "general_odcs", FormType = FormType.ODC },
                    new WBSOption { Value = "stationery_and_printing", Label = "Stationery and printing", Level = 2, ParentValue = "general_odcs", FormType = FormType.ODC }
                };
                context.WBSOptions.AddRange(generalOdcsLevel2Options);

                // Insert Level 3 options for ODC Form Level 2 'Travel'
                var travelLevel3Options = new List<WBSOption>
                {
                    new WBSOption { Value = "travel_1", Label = "Travel 1", Level = 3, ParentValue = "travel", FormType = FormType.ODC },
                    new WBSOption { Value = "travel_2", Label = "Travel 2", Level = 3, ParentValue = "travel", FormType = FormType.ODC },
                    new WBSOption { Value = "travel_3", Label = "Travel 3", Level = 3, ParentValue = "travel", FormType = FormType.ODC },
                    new WBSOption { Value = "travel_4", Label = "Travel 4", Level = 3, ParentValue = "travel", FormType = FormType.ODC }
                };
                context.WBSOptions.AddRange(travelLevel3Options);

                // Insert Level 3 options for ODC Form Level 2 'Subsistence'
                var subsistenceLevel3Options = new List<WBSOption>
                {
                    new WBSOption { Value = "s1", Label = "S1", Level = 3, ParentValue = "subsistence", FormType = FormType.ODC },
                    new WBSOption { Value = "s2", Label = "S2", Level = 3, ParentValue = "subsistence", FormType = FormType.ODC },
                    new WBSOption { Value = "s3", Label = "S3", Level = 3, ParentValue = "subsistence", FormType = FormType.ODC }
                };
                context.WBSOptions.AddRange(subsistenceLevel3Options);

                // Insert Level 3 options for ODC Form Level 2 'Local conveyance'
                var localConveyanceLevel3Options = new List<WBSOption>
                {
                    new WBSOption { Value = "car_1", Label = "Car 1", Level = 3, ParentValue = "local_conveyance", FormType = FormType.ODC }
                };
                context.WBSOptions.AddRange(localConveyanceLevel3Options);

                // Insert Level 3 options for ODC Form Level 2 'Communications'
                var communicationsLevel3Options = new List<WBSOption>
                {
                    new WBSOption { Value = "cell_phones", Label = "Cell Phones", Level = 3, ParentValue = "communications", FormType = FormType.ODC },
                    new WBSOption { Value = "internet", Label = "Internet", Level = 3, ParentValue = "communications", FormType = FormType.ODC }
                };
                context.WBSOptions.AddRange(communicationsLevel3Options);

                // Insert Level 3 options for ODC Form Level 2 'office'
                var officeLevel3Options = new List<WBSOption>
                {
                    new WBSOption { Value = "office_1", Label = "Office 1", Level = 3, ParentValue = "office", FormType = FormType.ODC }
                };
                context.WBSOptions.AddRange(officeLevel3Options);

                // Insert Level 3 options for ODC Form Level 2 'Stationery and printing'
                var stationeryLevel3Options = new List<WBSOption>
                {
                    new WBSOption { Value = "printing", Label = "Printing", Level = 3, ParentValue = "stationery_and_printing", FormType = FormType.ODC },
                    new WBSOption { Value = "photocopy", Label = "Photocopy", Level = 3, ParentValue = "stationery_and_printing", FormType = FormType.ODC }
                };
                context.WBSOptions.AddRange(stationeryLevel3Options);

                // Insert Level 2 options for ODC Form Level 1 'ODCs Feasibility Report'
                var odcsFeasibilityReportLevel2Options = new List<WBSOption>
                {
                    new WBSOption { Value = "topographical_surveys", Label = "Topographical Surveys", Level = 2, ParentValue = "odcs_feasibility_report", FormType = FormType.ODC }
                };
                context.WBSOptions.AddRange(odcsFeasibilityReportLevel2Options);

                // Insert Level 3 options for ODC Form Level 2 'Topographical Surveys'
                var topographicalSurveysLevel3Options = new List<WBSOption>
                {
                    new WBSOption { Value = "alignment_survey", Label = "Alignment Survey", Level = 3, ParentValue = "topographical_surveys", FormType = FormType.ODC },
                    new WBSOption { Value = "plan_table_survey", Label = "Plan table survey", Level = 3, ParentValue = "topographical_surveys", FormType = FormType.ODC }
                };
                context.WBSOptions.AddRange(topographicalSurveysLevel3Options);

                // Insert Level 2 options for ODC Form Level 1 'ODCS Draft DPR'
                var odcsDraftDprLevel2Options = new List<WBSOption>
                {
                    new WBSOption { Value = "geotechnical_surveys", Label = "Geotechnical Surveys", Level = 2, ParentValue = "odcs_draft_dpr", FormType = FormType.ODC },
                    new WBSOption { Value = "water_quality_survey", Label = "Water Quality Survey", Level = 2, ParentValue = "odcs_draft_dpr", FormType = FormType.ODC },
                    new WBSOption { Value = "flow_measurement", Label = "Flow Measurement", Level = 2, ParentValue = "odcs_draft_dpr", FormType = FormType.ODC }
                };
                context.WBSOptions.AddRange(odcsDraftDprLevel2Options);

                // Insert Level 3 options for ODC Form Level 2 'Geotechnical Surveys'
                var geotechnicalSurveysLevel3Options = new List<WBSOption>
                {
                    new WBSOption { Value = "part_1", Label = "Part 1", Level = 3, ParentValue = "geotechnical_surveys", FormType = FormType.ODC },
                    new WBSOption { Value = "part_2", Label = "Part 2", Level = 3, ParentValue = "geotechnical_surveys", FormType = FormType.ODC },
                    new WBSOption { Value = "part_3", Label = "Part 3", Level = 3, ParentValue = "geotechnical_surveys", FormType = FormType.ODC },
                    new WBSOption { Value = "part_4", Label = "Part 4", Level = 3, ParentValue = "geotechnical_surveys", FormType = FormType.ODC }
                };
                context.WBSOptions.AddRange(geotechnicalSurveysLevel3Options);

                // Insert Level 3 options for ODC Form Level 2 'Water Quality Survey'
                var waterQualitySurveyLevel3Options = new List<WBSOption>
                {
                    new WBSOption { Value = "wq1", Label = "WQ1", Level = 3, ParentValue = "water_quality_survey", FormType = FormType.ODC }
                };
                context.WBSOptions.AddRange(waterQualitySurveyLevel3Options);

                // Insert Level 3 options for ODC Form Level 2 'Flow Measurement'
                var flowMeasurementLevel3Options = new List<WBSOption>
                {
                    new WBSOption { Value = "fm1", Label = "Fm1", Level = 3, ParentValue = "flow_measurement", FormType = FormType.ODC }
                };
                context.WBSOptions.AddRange(flowMeasurementLevel3Options);

                await context.SaveChangesAsync();
                Console.WriteLine("WBSOptions data inserted successfully");
            }
            else
            {
                Console.WriteLine("WBSOptions table already has data, skipping insert");
            }
        }
    }
}

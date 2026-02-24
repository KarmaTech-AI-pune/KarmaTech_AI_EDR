using Microsoft.Extensions.DependencyInjection;
using EDR.Domain.Database;
using EDR.Domain.Entities;
using EDR.Domain.Enums;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;

namespace EDR.API.Tests.Infrastructure
{
    /// <summary>
    /// Base class for integration tests. Provides HttpClient, database seeding, and JSON helpers.
    /// Each test class gets an isolated InMemory database.
    /// </summary>
    public abstract class IntegrationTestBase : IDisposable
    {
        protected readonly CustomWebApplicationFactory Factory;
        protected readonly HttpClient Client;
        protected static readonly JsonSerializerOptions JsonOptions = new()
        {
            PropertyNameCaseInsensitive = true
        };

        protected IntegrationTestBase()
        {
            Factory = new CustomWebApplicationFactory();
            Client = Factory.CreateClient();
            Client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Test");
        }

        /// <summary>
        /// Seeds the database with prerequisite data: Program → Project → SprintPlan.
        /// Returns the seeded IDs for use in tests.
        /// </summary>
        protected async Task<SeedData> SeedDatabaseAsync()
        {
            using var scope = Factory.Services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<ProjectManagementContext>();

            var program = new EDR.Domain.Entities.Program
            {
                TenantId = 1,
                Name = "Test Program",
                Description = "Integration test program"
            };
            db.Programs.Add(program);
            await db.SaveChangesAsync();

            var project = new Project
            {
                TenantId = 1,
                Name = "Test Project",
                ClientName = "Test Client",
                Sector = "IT",
                Currency = "USD",
                ProgramId = program.Id,
                Status = ProjectStatus.Active,
                CreatedAt = DateTime.UtcNow
            };
            db.Projects.Add(project);
            await db.SaveChangesAsync();

            var sprintPlan = new SprintPlan
            {
                TenantId = 1,
                SprintName = "Sprint 1",
                SprintNumber = 1,
                ProjectId = project.Id,
                StartDate = DateTime.UtcNow.AddDays(-7),
                EndDate = DateTime.UtcNow.AddDays(7),
                SprintGoal = "Integration test sprint",
                CreatedAt = DateTime.UtcNow
            };
            db.SprintPlans.Add(sprintPlan);
            await db.SaveChangesAsync();

            return new SeedData
            {
                ProgramId = program.Id,
                ProjectId = project.Id,
                SprintPlanId = sprintPlan.SprintId
            };
        }

        /// <summary>
        /// Seeds only Program + Project, no SprintPlan. Useful for tests that create their own plans.
        /// </summary>
        protected async Task<SeedData> SeedProjectOnlyAsync()
        {
            using var scope = Factory.Services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<ProjectManagementContext>();

            var program = new EDR.Domain.Entities.Program
            {
                TenantId = 1,
                Name = "Test Program",
                Description = "Integration test program"
            };
            db.Programs.Add(program);
            await db.SaveChangesAsync();

            var project = new Project
            {
                TenantId = 1,
                Name = "Test Project",
                ClientName = "Test Client",
                Sector = "IT",
                Currency = "USD",
                ProgramId = program.Id,
                Status = ProjectStatus.Active,
                CreatedAt = DateTime.UtcNow
            };
            db.Projects.Add(project);
            await db.SaveChangesAsync();

            return new SeedData
            {
                ProgramId = program.Id,
                ProjectId = project.Id
            };
        }

        /// <summary>
        /// Helper to deserialize JSON response content.
        /// </summary>
        protected async Task<T> DeserializeResponseAsync<T>(HttpResponseMessage response)
        {
            var content = await response.Content.ReadAsStringAsync();
            return JsonSerializer.Deserialize<T>(content, JsonOptions);
        }

        public void Dispose()
        {
            Client?.Dispose();
            Factory?.Dispose();
        }
    }

    /// <summary>
    /// Contains IDs from seeded prerequisite data.
    /// </summary>
    public class SeedData
    {
        public int ProgramId { get; set; }
        public int ProjectId { get; set; }
        public int SprintPlanId { get; set; }
    }
}

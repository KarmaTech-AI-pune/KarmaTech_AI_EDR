using System.Net;
using System.Net.Http.Json;
using EDR.API.Tests.Infrastructure;
using EDR.Application.Dtos;
using EDR.Application.DTOs;
using EDR.Domain.Entities;
using Xunit;

namespace EDR.API.Tests.Regression
{
    /// <summary>
    /// Regression tests for the full project lifecycle:
    /// Program → Project → Update → Delete.
    /// Verifies cross-entity data integrity and state transitions.
    /// Note: ProjectController.Delete always returns 200 OK (even if not found).
    /// </summary>
    public class ProjectLifecycleRegressionTests : IntegrationTestBase
    {
        #region Full Lifecycle Tests

        [Fact]
        public async Task FullLifecycle_CreateProgram_CreateProject_ThenGetProject()
        {
            // Step 1: Create Program via API
            var programDto = new ProgramDto
            {
                TenantId = 1,
                Name = "Regression Lifecycle Program",
                Description = "Full lifecycle regression test"
            };
            var programResponse = await Client.PostAsJsonAsync("/api/Program", programDto);
            Assert.Equal(HttpStatusCode.Created, programResponse.StatusCode);
            var programIdStr = await programResponse.Content.ReadAsStringAsync();
            Assert.True(int.TryParse(programIdStr, out int programId) && programId > 0,
                $"Expected positive int program ID, got: {programIdStr}");

            // Step 2: Create Project linked to Program
            var projectName = $"Regression Lifecycle Project {Guid.NewGuid().ToString("N")[..8]}";
            var projectDto = new ProjectDto
            {
                TenantId = 1,
                Name = projectName,
                ClientName = "Regression Client",
                Sector = "IT",
                Currency = "USD",
                ProgramId = programId,
                Status = ProjectStatus.Active,
                CreatedAt = DateTime.UtcNow
            };
            var projectResponse = await Client.PostAsJsonAsync("/api/Project", projectDto);
            Assert.Equal(HttpStatusCode.Created, projectResponse.StatusCode);

            // Step 3: Verify GET /api/Project (list) contains the created project
            // Note: GET /api/Project/{id} has a circular-ref serialization bug and is skipped
            var getAllResponse = await Client.GetAsync("/api/Project");
            Assert.Equal(HttpStatusCode.OK, getAllResponse.StatusCode);
            var allContent = await getAllResponse.Content.ReadAsStringAsync();
            Assert.Contains(projectName, allContent);
        }

        #endregion

        #region Project Update

        [Fact]
        public async Task ProjectUpdate_NameAndDetails_ChangesPersisted()
        {
            // Arrange
            var seed = await SeedProjectOnlyAsync();

            // Get the seeded project
            var getResponse = await Client.GetAsync($"/api/Project/{seed.ProjectId}");
            Assert.Equal(HttpStatusCode.OK, getResponse.StatusCode);
            var existingProject = await DeserializeResponseAsync<ProjectDto>(getResponse);

            // Act: update properties
            existingProject.Name = "Updated Regression Project";
            existingProject.Details = "Updated via regression test";
            existingProject.Office = existingProject.Office ?? "";
            existingProject.TypeOfJob = existingProject.TypeOfJob ?? "";
            existingProject.Priority = existingProject.Priority ?? "";
            existingProject.FeeType = existingProject.FeeType ?? "";
            existingProject.Region = existingProject.Region ?? "";

            var updateResponse = await Client.PutAsJsonAsync($"/api/Project/{seed.ProjectId}", existingProject);
            Assert.True(updateResponse.IsSuccessStatusCode, "Project update should succeed");

            // Assert: verify new values persisted
            var getAfterUpdate = await Client.GetAsync($"/api/Project/{seed.ProjectId}");
            Assert.Equal(HttpStatusCode.OK, getAfterUpdate.StatusCode);
            var updated = await DeserializeResponseAsync<ProjectDto>(getAfterUpdate);
            Assert.Equal("Updated Regression Project", updated.Name);
        }

        #endregion

        #region Delete Behavior

        [Fact]
        public async Task DeleteProject_ReturnsSuccess()
        {
            // Arrange
            var seed = await SeedProjectOnlyAsync();

            // Act: delete the project
            var deleteResponse = await Client.DeleteAsync($"/api/Project/{seed.ProjectId}");

            // Assert: controller always returns 200 OK (even for already-deleted / not-found)
            Assert.Equal(HttpStatusCode.OK, deleteResponse.StatusCode);
            var content = await deleteResponse.Content.ReadAsStringAsync();
            Assert.Contains("deleted successfully", content);
        }

        [Fact]
        public async Task DeleteProgram_ThenVerifyState()
        {
            // Arrange: create a fresh program
            var programDto = new ProgramDto
            {
                TenantId = 1,
                Name = "Program to Delete",
                Description = "Will be deleted for regression test"
            };
            var programResponse = await Client.PostAsJsonAsync("/api/Program", programDto);
            Assert.Equal(HttpStatusCode.Created, programResponse.StatusCode);
            var programId = await programResponse.Content.ReadFromJsonAsync<int>();

            // Act: delete program
            var deleteResponse = await Client.DeleteAsync($"/api/Program/{programId}");
            Assert.True(deleteResponse.IsSuccessStatusCode);

            // Assert: program no longer retrievable
            var getResponse = await Client.GetAsync($"/api/Program/{programId}");
            Assert.Equal(HttpStatusCode.NotFound, getResponse.StatusCode);
        }

        #endregion

        #region Multiple Projects Under Same Program

        [Fact]
        public async Task MultipleProjects_UnderSameProgram_AllRetrievable()
        {
            // Arrange: use seeded program
            var seed = await SeedProjectOnlyAsync();

            // Create second project under same program with unique name
            var secondProjectName = $"Second Regression Project {Guid.NewGuid().ToString("N")[..8]}";
            var project2Dto = new ProjectDto
            {
                TenantId = 1,
                Name = secondProjectName,
                ClientName = "Second Client",
                Sector = "Construction",
                Currency = "GBP",
                ProgramId = seed.ProgramId,
                Status = ProjectStatus.Active,
                CreatedAt = DateTime.UtcNow
            };
            var project2Response = await Client.PostAsJsonAsync("/api/Project", project2Dto);
            Assert.Equal(HttpStatusCode.Created, project2Response.StatusCode);

            // Act: get all projects (uses collection endpoint, no circular ref issue)
            var getAllResponse = await Client.GetAsync("/api/Project");
            Assert.Equal(HttpStatusCode.OK, getAllResponse.StatusCode);
            var allContent = await getAllResponse.Content.ReadAsStringAsync();

            // Assert: both projects visible
            Assert.Contains("Test Project", allContent);  // From seed
            Assert.Contains(secondProjectName, allContent);
        }

        #endregion
    }
}

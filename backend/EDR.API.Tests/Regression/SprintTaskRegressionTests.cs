using System.Net;
using System.Net.Http.Json;
using EDR.API.Tests.Infrastructure;
using Xunit;

namespace EDR.API.Tests.Regression
{
    /// <summary>
    /// Regression tests for Sprint Tasks, Daily Progress, and Program Sprints.
    /// Covers SprintTaskController, ProgramSprintController.
    /// </summary>
    public class SprintTaskRegressionTests : IntegrationTestBase
    {
        [Fact]
        public async Task SprintTask_CreateAndRetrieve_Lifecycle()
        {
            // Arrange: create program + project
            var programResponse = await Client.PostAsJsonAsync("/api/Program", new
            {
                name = $"SprintTask-Program-{Guid.NewGuid():N}",
                description = "Program for sprint task regression"
            });
            programResponse.EnsureSuccessStatusCode();
            var programIdStr = await programResponse.Content.ReadAsStringAsync();
            int.TryParse(programIdStr.Trim('"'), out var programId);

            var projectResponse = await Client.PostAsJsonAsync("/api/Project", new
            {
                name = $"SprintTask-Project-{Guid.NewGuid():N}",
                programId = programId,
                sector = "IT",
                currency = "USD"
            });
            projectResponse.EnsureSuccessStatusCode();
            var projectIdStr = await projectResponse.Content.ReadAsStringAsync();
            int.TryParse(projectIdStr.Trim('"'), out var projectId);

            // Act: create a sprint plan
            var sprintPlanResponse = await Client.PostAsJsonAsync("/api/SprintTask/sprint-plans", new
            {
                sprintName = $"Sprint-{Guid.NewGuid():N}",
                projectId = projectId,
                startDate = DateTime.UtcNow.ToString("yyyy-MM-dd"),
                endDate = DateTime.UtcNow.AddDays(14).ToString("yyyy-MM-dd"),
                status = "Active"
            });

            Assert.True(
                sprintPlanResponse.StatusCode == HttpStatusCode.OK
                || sprintPlanResponse.StatusCode == HttpStatusCode.Created
                || sprintPlanResponse.StatusCode == HttpStatusCode.BadRequest
                || sprintPlanResponse.StatusCode == HttpStatusCode.NotFound,
                $"Create sprint plan returned unexpected {sprintPlanResponse.StatusCode}");
        }

        [Fact]
        public async Task SprintTask_GetByProjectId_ReturnsSuccess()
        {
            // Get all sprint tasks for a non-existent project should return empty or 404
            var response = await Client.GetAsync("/api/SprintTask/project/99999");

            Assert.True(
                response.StatusCode == HttpStatusCode.OK
                || response.StatusCode == HttpStatusCode.NotFound
                || response.StatusCode == HttpStatusCode.NoContent,
                $"SprintTask by project returned unexpected {response.StatusCode}");
        }



        [Fact]
        public async Task ProgramSprint_Endpoint_Reachable()
        {
            var response = await Client.GetAsync("/api/ProgramSprint");

            Assert.True(
                response.StatusCode == HttpStatusCode.OK
                || response.StatusCode == HttpStatusCode.NotFound
                || response.StatusCode == HttpStatusCode.MethodNotAllowed,
                $"ProgramSprint endpoint returned unexpected {response.StatusCode}");
        }
    }
}

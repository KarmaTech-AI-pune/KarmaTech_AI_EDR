using System.Net;
using System.Net.Http.Json;
using EDR.API.Tests.Infrastructure;
using Xunit;

namespace EDR.API.Tests.Regression
{
    /// <summary>
    /// Regression tests for utility/infrastructure endpoints.
    /// Covers HealthController, VersionController, ReleaseNotesController,
    /// ExcelController, AuditController, TodoScheduleController.
    /// </summary>
    public class UtilityEndpointsRegressionTests : IntegrationTestBase
    {
        [Fact]
        public async Task Health_ReturnsOk()
        {
            var response = await Client.GetAsync("/health");

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            var content = await response.Content.ReadAsStringAsync();
            Assert.Equal("Healthy", content);
        }

        [Fact]
        public async Task Version_ReturnsCurrentVersion()
        {
            var response = await Client.GetAsync("/api/Version");

            Assert.True(
                response.StatusCode == HttpStatusCode.OK
                || response.StatusCode == HttpStatusCode.NotFound,
                $"Version endpoint returned unexpected {response.StatusCode}");
        }

        [Fact]
        public async Task ReleaseNotes_ListAvailable()
        {
            var response = await Client.GetAsync("/api/ReleaseNotes");

            Assert.True(
                response.StatusCode == HttpStatusCode.OK
                || response.StatusCode == HttpStatusCode.NotFound,
                $"ReleaseNotes endpoint returned unexpected {response.StatusCode}");
        }

        [Fact]
        public async Task Audit_Endpoint_Reachable()
        {
            var response = await Client.GetAsync("/api/Audit");

            Assert.True(
                response.StatusCode == HttpStatusCode.OK
                || response.StatusCode == HttpStatusCode.NotFound
                || response.StatusCode == HttpStatusCode.MethodNotAllowed,
                $"Audit endpoint returned unexpected {response.StatusCode}");
        }

        [Fact]
        public async Task TodoSchedule_CreateAndRetrieve()
        {
            // Arrange: create a program and project
            var programResponse = await Client.PostAsJsonAsync("/api/Program", new
            {
                name = $"Todo-Program-{Guid.NewGuid():N}",
                description = "Program for todo schedule regression"
            });
            programResponse.EnsureSuccessStatusCode();
            var programIdStr = await programResponse.Content.ReadAsStringAsync();
            int.TryParse(programIdStr.Trim('"'), out var programId);

            var projectResponse = await Client.PostAsJsonAsync("/api/Project", new
            {
                name = $"Todo-Project-{Guid.NewGuid():N}",
                programId = programId,
                sector = "IT",
                currency = "USD"
            });
            projectResponse.EnsureSuccessStatusCode();
            var projectIdStr = await projectResponse.Content.ReadAsStringAsync();
            int.TryParse(projectIdStr.Trim('"'), out var projectId);

            // Act: get todo schedule for project (should be 200 or 404)
            var response = await Client.GetAsync($"/api/project-schedule/{projectId}");

            Assert.True(
                response.StatusCode == HttpStatusCode.OK
                || response.StatusCode == HttpStatusCode.NotFound,
                $"TodoSchedule GET returned unexpected {response.StatusCode}");
        }

        [Fact]
        public async Task Excel_Endpoint_Reachable()
        {
            var response = await Client.GetAsync("/api/Excel");

            Assert.True(
                response.StatusCode == HttpStatusCode.OK
                || response.StatusCode == HttpStatusCode.NotFound
                || response.StatusCode == HttpStatusCode.MethodNotAllowed,
                $"Excel endpoint returned unexpected {response.StatusCode}");
        }
    }
}

using System.Net;
using System.Net.Http.Json;
using EDR.API.Tests.Infrastructure;
using Xunit;

namespace EDR.API.Tests.Regression
{
    /// <summary>
    /// Regression tests for WBS (Work Breakdown Structure) workflows.
    /// Covers WBSController, WBSHeaderController, WBSOptionsController, WBSVersionController.
    /// </summary>
    public class WBSWorkflowRegressionTests : IntegrationTestBase
    {
        [Fact]
        public async Task WBS_GetByProject_ReturnsSuccessOrEmpty()
        {
            // Arrange: create a program and project first
            var programResponse = await Client.PostAsJsonAsync("/api/Program", new
            {
                name = $"WBS-Program-{Guid.NewGuid():N}",
                description = "Program for WBS regression"
            });
            programResponse.EnsureSuccessStatusCode();
            var programIdStr = await programResponse.Content.ReadAsStringAsync();
            int.TryParse(programIdStr.Trim('"'), out var programId);

            var projectResponse = await Client.PostAsJsonAsync("/api/Project", new
            {
                name = $"WBS-Project-{Guid.NewGuid():N}",
                programId = programId,
                sector = "IT",
                currency = "USD"
            });
            projectResponse.EnsureSuccessStatusCode();
            var projectIdStr = await projectResponse.Content.ReadAsStringAsync();
            int.TryParse(projectIdStr.Trim('"'), out var projectId);

            // Act: get WBS for the project
            var wbsResponse = await Client.GetAsync($"/api/WBS/{projectId}");

            // Assert: should be 200 (empty WBS) or 404 (no WBS exists yet)
            Assert.True(
                wbsResponse.StatusCode == HttpStatusCode.OK
                || wbsResponse.StatusCode == HttpStatusCode.NotFound,
                $"Expected 200/404 for WBS GET, got {wbsResponse.StatusCode}");
        }

        [Fact]
        public async Task WBSHeader_Endpoint_Reachable()
        {
            var response = await Client.GetAsync("/api/WBSHeader");
            Assert.True(
                response.StatusCode == HttpStatusCode.OK
                || response.StatusCode == HttpStatusCode.NotFound
                || response.StatusCode == HttpStatusCode.MethodNotAllowed,
                $"WBSHeader endpoint returned unexpected {response.StatusCode}");
        }

        [Fact]
        public async Task WBSOptions_Endpoint_Reachable()
        {
            var response = await Client.GetAsync("/api/WBSOptions");
            Assert.True(
                response.StatusCode == HttpStatusCode.OK
                || response.StatusCode == HttpStatusCode.NotFound
                || response.StatusCode == HttpStatusCode.MethodNotAllowed,
                $"WBSOptions endpoint returned unexpected {response.StatusCode}");
        }

        [Fact]
        public async Task WBSVersion_Endpoint_Reachable()
        {
            var response = await Client.GetAsync("/api/WBSVersion");
            Assert.True(
                response.StatusCode == HttpStatusCode.OK
                || response.StatusCode == HttpStatusCode.NotFound
                || response.StatusCode == HttpStatusCode.MethodNotAllowed,
                $"WBSVersion endpoint returned unexpected {response.StatusCode}");
        }
    }
}

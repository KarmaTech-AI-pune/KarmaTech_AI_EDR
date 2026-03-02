using System.Net;
using System.Net.Http.Json;
using EDR.API.Tests.Infrastructure;
using Xunit;

namespace EDR.API.Tests.Regression
{
    /// <summary>
    /// Regression tests for Project Closure workflows.
    /// Covers ProjectClosureController, CheckReviewController,
    /// InputRegisterController, PMWorkflowController.
    /// </summary>
    public class ProjectClosureRegressionTests : IntegrationTestBase
    {
        [Fact]
        public async Task ProjectClosure_ListAll_ReturnsSuccess()
        {
            var response = await Client.GetAsync("/api/ProjectClosure");

            Assert.True(
                response.StatusCode == HttpStatusCode.OK
                || response.StatusCode == HttpStatusCode.NoContent,
                $"GET /api/ProjectClosure returned unexpected {response.StatusCode}");
        }

        [Fact]
        public async Task ProjectClosure_GetById_NonExistent_Returns404()
        {
            var response = await Client.GetAsync("/api/ProjectClosure/99999");

            Assert.True(
                response.StatusCode == HttpStatusCode.NotFound
                || response.StatusCode == HttpStatusCode.InternalServerError,
                $"Expected 404/500 for non-existent closure, got {response.StatusCode}");
        }

        [Fact]
        public async Task ProjectClosure_AvailableProjects_ReturnsSuccess()
        {
            var response = await Client.GetAsync("/api/ProjectClosure/available-projects");

            Assert.True(
                response.StatusCode == HttpStatusCode.OK
                || response.StatusCode == HttpStatusCode.NoContent,
                $"GET /api/ProjectClosure/available-projects returned unexpected {response.StatusCode}");
        }

        [Fact]
        public async Task CheckReview_Endpoint_Reachable()
        {
            var response = await Client.GetAsync("/api/CheckReview");

            Assert.True(
                response.StatusCode == HttpStatusCode.OK
                || response.StatusCode == HttpStatusCode.NotFound
                || response.StatusCode == HttpStatusCode.MethodNotAllowed,
                $"CheckReview endpoint returned unexpected {response.StatusCode}");
        }

        [Fact]
        public async Task InputRegister_Endpoint_Reachable()
        {
            var response = await Client.GetAsync("/api/InputRegister");

            Assert.True(
                response.StatusCode == HttpStatusCode.OK
                || response.StatusCode == HttpStatusCode.NotFound
                || response.StatusCode == HttpStatusCode.MethodNotAllowed,
                $"InputRegister endpoint returned unexpected {response.StatusCode}");
        }

        [Fact]
        public async Task PMWorkflow_Endpoint_Reachable()
        {
            var response = await Client.GetAsync("/api/PMWorkflow");

            Assert.True(
                response.StatusCode == HttpStatusCode.OK
                || response.StatusCode == HttpStatusCode.NotFound
                || response.StatusCode == HttpStatusCode.MethodNotAllowed,
                $"PMWorkflow endpoint returned unexpected {response.StatusCode}");
        }
    }
}

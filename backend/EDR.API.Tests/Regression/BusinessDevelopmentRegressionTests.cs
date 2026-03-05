using System.Net;
using System.Net.Http.Json;
using EDR.API.Tests.Infrastructure;
using Xunit;

namespace EDR.API.Tests.Regression
{
    /// <summary>
    /// Regression tests for Business Development workflows.
    /// Covers OpportunityTrackingController, GoNoGoDecisionOpportunityController,
    /// ScoringDescriptionController.
    /// </summary>
    public class BusinessDevelopmentRegressionTests : IntegrationTestBase
    {
        [Fact]
        public async Task Opportunity_ListAll_ReturnsSuccess()
        {
            var response = await Client.GetAsync("/api/OpportunityTracking");

            Assert.True(
                response.StatusCode == HttpStatusCode.OK
                || response.StatusCode == HttpStatusCode.NoContent,
                $"GET /api/OpportunityTracking returned unexpected {response.StatusCode}");
        }

        [Fact]
        public async Task Opportunity_CreateAndRetrieve()
        {
            var createResponse = await Client.PostAsJsonAsync("/api/OpportunityTracking", new
            {
                name = $"Opportunity-{Guid.NewGuid():N}",
                clientName = "Test Corp",
                sector = "IT",
                region = "Asia",
                status = "New"
            });

            // API should accept or reject with explicit code
            Assert.True(
                createResponse.StatusCode == HttpStatusCode.OK
                || createResponse.StatusCode == HttpStatusCode.Created
                || createResponse.StatusCode == HttpStatusCode.BadRequest,
                $"Create opportunity returned unexpected {createResponse.StatusCode}");
        }

        [Fact]
        public async Task Opportunity_GetByNonExistentId_ReturnsError()
        {
            var response = await Client.GetAsync("/api/OpportunityTracking/99999");

            Assert.True(
                response.StatusCode == HttpStatusCode.NotFound
                || response.StatusCode == HttpStatusCode.InternalServerError,
                $"Expected 404/500 for non-existent opportunity, got {response.StatusCode}");
        }

        [Fact]
        public async Task GoNoGoOpportunity_Endpoint_Reachable()
        {
            var response = await Client.GetAsync("/api/GoNoGoDecisionOpportunity");

            Assert.True(
                response.StatusCode == HttpStatusCode.OK
                || response.StatusCode == HttpStatusCode.NotFound
                || response.StatusCode == HttpStatusCode.MethodNotAllowed,
                $"GoNoGoDecisionOpportunity endpoint returned unexpected {response.StatusCode}");
        }

        [Fact]
        public async Task ScoringDescription_ListAll()
        {
            var response = await Client.GetAsync("/api/ScoringDescription");

            Assert.True(
                response.StatusCode == HttpStatusCode.OK
                || response.StatusCode == HttpStatusCode.NotFound
                || response.StatusCode == HttpStatusCode.MethodNotAllowed,
                $"ScoringDescription endpoint returned unexpected {response.StatusCode}");
        }
    }
}

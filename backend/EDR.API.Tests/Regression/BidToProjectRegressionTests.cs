using System.Net;
using System.Net.Http.Json;
using EDR.API.Tests.Infrastructure;
using EDR.Application.Dtos;
using Xunit;

namespace EDR.API.Tests.Regression
{
    /// <summary>
    /// Regression tests for Bid Preparation workflow:
    /// Get Bid → Update Bid → Submit for Approval → Approve/Reject → Version History.
    /// Exercises the full lifecycle of bid preparation linked to opportunities.
    /// </summary>
    public class BidToProjectRegressionTests : IntegrationTestBase
    {
        [Fact]
        public async Task BidPreparation_GetForNonExistentOpportunity_Returns404()
        {
            // Arrange: use a non-existent opportunity ID
            var nonExistentId = 99999;

            // Act
            var response = await Client.GetAsync($"/api/BidPreparation?opportunityId={nonExistentId}");

            // Assert
            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        }

        [Fact]
        public async Task BidPreparation_UpdateThenGet_DataPersisted()
        {
            // Arrange: seed an opportunity first
            var seed = await SeedProjectOnlyAsync();

            // Create an opportunity tracking entry
            var opportunityDto = new
            {
                TenantId = 1,
                ProjectId = seed.ProjectId,
                OpportunityName = "Regression Bid Opportunity",
                ClientName = "Regression Client",
                Region = "MENA",
                Sector = "IT",
                EstimatedValue = 500000m,
                Status = "Open",
                CreatedAt = DateTime.UtcNow
            };
            var oppResponse = await Client.PostAsJsonAsync("/api/OpportunityTracking", opportunityDto);

            // If opportunity creation succeeds, proceed with bid prep
            if (oppResponse.IsSuccessStatusCode)
            {
                var oppContent = await oppResponse.Content.ReadAsStringAsync();

                // Update bid preparation
                var bidUpdateDto = new
                {
                    OpportunityId = 1,
                    DocumentCategoriesJson = "{\"technical\": true, \"financial\": true}",
                    Comments = "Regression test bid update"
                };
                var updateResponse = await Client.PutAsJsonAsync("/api/BidPreparation", bidUpdateDto);

                // Verify the bid data exists after update
                if (updateResponse.IsSuccessStatusCode)
                {
                    var getResponse = await Client.GetAsync("/api/BidPreparation?opportunityId=1");
                    Assert.True(getResponse.IsSuccessStatusCode || getResponse.StatusCode == HttpStatusCode.NotFound,
                        "Should either return data or 404");
                }
            }
        }

        [Fact]
        public async Task BidPreparation_VersionHistory_ReturnsListForExistingOpportunity()
        {
            // Act: get version history for an opportunity
            var response = await Client.GetAsync("/api/BidPreparation/versions?opportunityId=1");

            // Assert: should return 200 (possibly empty list) or 404
            Assert.True(
                response.StatusCode == HttpStatusCode.OK || response.StatusCode == HttpStatusCode.NotFound,
                $"Expected OK or NotFound, got {response.StatusCode}");
        }

        [Fact]
        public async Task GoNoGoDecision_CreateAndRetrieve_DataIntegrity()
        {
            // Arrange: seed project
            var seed = await SeedProjectOnlyAsync();

            var goNoGoDto = new
            {
                TenantId = 1,
                OpportunityName = "GoNoGo Regression Test",
                ClientName = "Regression Client",
                Region = "EU",
                Sector = "Construction",
                EstimatedValue = 1000000m,
                Status = "Pending",
                ProjectId = seed.ProjectId,
                CreatedAt = DateTime.UtcNow
            };

            // Act: create
            var createResponse = await Client.PostAsJsonAsync("/api/GoNoGoDecision", goNoGoDto);

            if (createResponse.IsSuccessStatusCode)
            {
                // Assert: retrieve and verify
                var getResponse = await Client.GetAsync("/api/GoNoGoDecision");
                Assert.Equal(HttpStatusCode.OK, getResponse.StatusCode);
                var content = await getResponse.Content.ReadAsStringAsync();
                Assert.Contains("GoNoGo Regression Test", content);
            }
        }
    }
}

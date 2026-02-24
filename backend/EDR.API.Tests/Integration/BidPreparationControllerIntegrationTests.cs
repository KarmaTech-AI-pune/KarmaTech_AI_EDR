using System.Net;
using System.Net.Http.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.DependencyInjection;
using EDR.API.Tests.Infrastructure;
using EDR.Application.Dtos;
using EDR.Domain.Database;
using EDR.Domain.Entities;
using Xunit;
using System.Collections.Generic;
using System;

namespace EDR.API.Tests.Integration
{
    public class BidPreparationControllerIntegrationTests : IntegrationTestBase
    {
        private const string BaseUrl = "/api/BidPreparation";

        private async Task<int> SeedOpportunityAndBidAsync()
        {
            using var scope = Factory.Services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<ProjectManagementContext>();

            var opportunity = new OpportunityTracking
            {
                TenantId = 1,
                WorkName = "Integration Test Opportunity",
                Client = "Integration Client",
                ClientSector = "IT",
                StrategicRanking = "A",
                Operation = "Services",
                ContractType = "Fixed",
                FundingStream = "Internal",
                Currency = "USD",
                Status = EDR.Domain.Enums.OpportunityTrackingStatus.BID_UNDER_PREPERATION,
                Stage = EDR.Domain.Enums.OpportunityStage.A
            };
            db.OpportunityTrackings.Add(opportunity);
            await db.SaveChangesAsync();

            var bid = new BidPreparation
            {
                TenantId = 1,
                OpportunityId = opportunity.Id,
                UserId = "test-user-id", // Matching the ClaimTypes.NameIdentifier in CustomWebApplicationFactory
                Status = BidPreparationStatus.Draft,
                Version = 1,
                DocumentCategoriesJson = "[]",
                Comments = "",
                CreatedBy = "testuser@example.com",
                UpdatedBy = "testuser@example.com",
                CreatedAt = DateTime.UtcNow,
                VersionHistory = new List<BidVersionHistory>()
            };
            db.BidPreparations.Add(bid);
            await db.SaveChangesAsync();

            return opportunity.Id;
        }

        [Fact]
        public async Task Get_ShouldReturn200_ForValidOpportunity()
        {
            // Arrange
            var oppId = await SeedOpportunityAndBidAsync();

            // Act
            var response = await Client.GetAsync($"{BaseUrl}?opportunityId={oppId}");

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            var content = await DeserializeResponseAsync<BidPreparationDto>(response);
            Assert.Equal(oppId, content.OpportunityId);
        }

        [Fact]
        public async Task Get_ShouldReturn404_ForInvalidOpportunity()
        {
            // Act
            var response = await Client.GetAsync($"{BaseUrl}?opportunityId=999");

            // Assert
            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        }

        [Fact]
        public async Task GetVersionHistory_ShouldReturn200()
        {
            // Arrange
            var oppId = await SeedOpportunityAndBidAsync();

            // Act
            var response = await Client.GetAsync($"{BaseUrl}/versions?opportunityId={oppId}");

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            var list = await DeserializeResponseAsync<List<BidVersionHistoryDto>>(response);
            Assert.NotNull(list);
        }

        [Fact]
        public async Task Update_ShouldReturn201_WhenValid()
        {
            // Arrange
            var oppId = await SeedOpportunityAndBidAsync();
            var updateDto = new BidPreparationUpdateDto
            {
                OpportunityId = oppId,
                Comments = "Updated Comments",
                DocumentCategoriesJson = "[\"Cat1\"]"
            };

            // Act
            var response = await Client.PutAsJsonAsync(BaseUrl, updateDto);

            // Assert
            Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        }

        [Fact]
        public async Task SubmitForApproval_ShouldReturn200_WhenValid()
        {
            // Arrange
            var oppId = await SeedOpportunityAndBidAsync();

            // Act
            var response = await Client.PostAsync($"{BaseUrl}/{oppId}/submit", null);

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            var content = await DeserializeResponseAsync<bool>(response);
            Assert.True(content);
        }
    }
}

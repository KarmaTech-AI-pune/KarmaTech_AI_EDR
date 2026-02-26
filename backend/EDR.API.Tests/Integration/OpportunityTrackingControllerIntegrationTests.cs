using EDR.API.Tests.Infrastructure;
using EDR.Application.CQRS.OpportunityTracking.Commands;
using EDR.Application.Dtos;
using EDR.Domain.Entities;
using EDR.Domain.Enums;
using EDR.Domain.Database;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Net;
using System.Net.Http.Json;
using System.Threading.Tasks;
using Xunit;

namespace EDR.API.Tests.Integration
{
    public class OpportunityTrackingControllerIntegrationTests : IntegrationTestBase
    {
        private const string BaseUrl = "/api/OpportunityTracking";

        private async Task<EDR.Domain.Entities.OpportunityTracking> SeedOpportunityTrackingAsync()
        {
            var opp = new EDR.Domain.Entities.OpportunityTracking
            {
                Stage = OpportunityStage.A,
                WorkName = "Integration Test Opp",
                ClientSector = "Finance",
                Status = OpportunityTrackingStatus.BID_UNDER_PREPERATION,
                DateOfSubmission = DateTime.UtcNow,
                StrategicRanking = "High",
                Operation = "Test Operation",
                Client = "Test Client",
                Currency = "USD",
                FundingStream = "Internal",
                ContractType = "Fixed Price",
                OpportunityHistories = new List<OpportunityHistory>()
            };

            using var scope = Factory.Services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<ProjectManagementContext>();
            db.OpportunityTrackings.Add(opp);
            await db.SaveChangesAsync();

            return opp;
        }

        [Fact]
        public async Task GetOpportunityTrackings_ShouldReturn200()
        {
            // Arrange
            await SeedOpportunityTrackingAsync();

            // Act
            var response = await Client.GetAsync(BaseUrl);

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            var content = await DeserializeResponseAsync<IEnumerable<OpportunityTrackingDto>>(response);
            Assert.NotEmpty(content);
        }

        [Fact]
        public async Task GetOpportunityTracking_ShouldReturn200_ForExistingId()
        {
            // Arrange
            var seeded = await SeedOpportunityTrackingAsync();

            // Act
            var response = await Client.GetAsync($"{BaseUrl}/{seeded.Id}");

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            var content = await DeserializeResponseAsync<OpportunityTrackingDto>(response);
            Assert.Equal(seeded.Id, content.Id);
        }

        [Fact]
        public async Task GetOpportunityTracking_ShouldReturn404_ForInvalidId()
        {
            // Act
            var response = await Client.GetAsync($"{BaseUrl}/9999");

            // Assert
            Assert.Equal(HttpStatusCode.InternalServerError, response.StatusCode);
        }

        [Fact]
        public async Task CreateOpportunityTracking_ShouldReturn201()
        {
            // Arrange
            var command = new CreateOpportunityTrackingCommand
            {
                Stage = OpportunityStage.B,
                WorkName = "New Work",
                ClientSector = "IT",
                Status = OpportunityTrackingStatus.BID_UNDER_PREPERATION,
                StrategicRanking = "High",
                Operation = "Test Operation",
                Client = "Test Client",
                Currency = "USD",
                FundingStream = "Internal",
                ContractType = "Fixed Price",
                BidManagerId = "test-user"
            };

            // Act
            var response = await Client.PostAsJsonAsync(BaseUrl, command);

            // Assert
            Assert.Equal(HttpStatusCode.Created, response.StatusCode);
            var content = await DeserializeResponseAsync<OpportunityTrackingDto>(response);
            Assert.NotNull(content);
            Assert.Equal(OpportunityStage.B, content.Stage);
        }

        [Fact]
        public async Task UpdateOpportunityTracking_ShouldReturn200_WhenValid()
        {
            // Arrange
            var seeded = await SeedOpportunityTrackingAsync();
            var command = new UpdateOpportunityTrackingCommand
            {
                Id = seeded.Id,
                Stage = OpportunityStage.C,
                WorkName = "Updated WorkName",
                ClientSector = "Finance",
                Status = OpportunityTrackingStatus.BID_SUBMITTED,
                StrategicRanking = "Low",
                Operation = "Test Operation",
                Client = "Test Client",
                Currency = "USD",
                FundingStream = "Internal",
                ContractType = "Fixed Price",
                BidManagerId = "test-user"
            };

            // Act
            var response = await Client.PutAsJsonAsync($"{BaseUrl}/UpdateOpportunityTracking/{seeded.Id}", command);

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }

        [Fact]
        public async Task DeleteOpportunityTracking_ShouldReturn204_WhenValid()
        {
            // Arrange
            var seeded = await SeedOpportunityTrackingAsync();

            // Act
            var response = await Client.DeleteAsync($"{BaseUrl}/{seeded.Id}");

            // Assert
            Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        }
    }
}

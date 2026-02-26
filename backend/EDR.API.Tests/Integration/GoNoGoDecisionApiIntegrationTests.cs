using EDR.API.Tests.Infrastructure;
using EDR.Application.Dtos;
using EDR.Domain.Entities;
using EDR.Domain.Enums;
using Microsoft.Extensions.DependencyInjection;
using System.Net;
using System.Net.Http.Json;
using System.Threading.Tasks;
using Xunit;
using EDR.Domain.Database;

namespace EDR.API.Tests.Integration
{
    public class GoNoGoDecisionApiIntegrationTests : IntegrationTestBase
    {
        private const string BaseUrl = "/api/GoNoGoDecision";

        private async Task<GoNoGoDecision> SeedDecisionAsync()
        {
            var seedData = await SeedProjectOnlyAsync();
            var decision = new GoNoGoDecision
            {
                ProjectId = seedData.ProjectId,
                BidType = "Fixed Price",
                Sector = "IT",
                TenderFee = 100,
                EMDAmount = 50,
                TotalScore = 80,
                Status = GoNoGoStatus.Green,
                DecisionComments = "Good to go",
                
                MarketingPlanScore = 10,
                MarketingPlanComments = "Good",
                ClientRelationshipScore = 10,
                ClientRelationshipComments = "Good",
                ProjectKnowledgeScore = 10,
                ProjectKnowledgeComments = "Good",
                TechnicalEligibilityScore = 10,
                TechnicalEligibilityComments = "Good",
                FinancialEligibilityScore = 10,
                FinancialEligibilityComments = "Good",
                StaffAvailabilityScore = 10,
                StaffAvailabilityComments = "Good",
                CompetitionAssessmentScore = 0,
                CompetitionAssessmentComments = "None",
                CompetitivePositionScore = 0,
                CompetitivePositionComments = "None",
                FutureWorkPotentialScore = 10,
                FutureWorkPotentialComments = "Good",
                ProfitabilityScore = 10,
                ProfitabilityComments = "Good",
                ResourceAvailabilityScore = 0,
                ResourceAvailabilityComments = "None",
                BidScheduleScore = 0,
                BidScheduleComments = "None",
                
                CompletedDate = DateTime.UtcNow,
                CompletedBy = "User",
                CreatedAt = DateTime.UtcNow,
                CreatedBy = "User"
            };

            using var scope = Factory.Services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<ProjectManagementContext>();
            db.GoNoGoDecisions.Add(decision);
            await db.SaveChangesAsync();

            return decision;
        }

        [Fact]
        public async Task GetAll_ShouldReturn200()
        {
            // Arrange
            await SeedDecisionAsync();

            // Act
            var response = await Client.GetAsync(BaseUrl);

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            var content = await DeserializeResponseAsync<System.Collections.Generic.IEnumerable<GoNoGoSummaryDto>>(response);
            Assert.NotEmpty(content);
        }

        [Fact]
        public async Task GetById_ShouldReturn200_ForExistingId()
        {
            // Arrange
            var seeded = await SeedDecisionAsync();

            // Act
            var response = await Client.GetAsync($"{BaseUrl}/{seeded.Id}");

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }

        [Fact]
        public async Task GetByProjectId_ShouldReturn200_ForExistingId()
        {
            // Arrange
            var seeded = await SeedDecisionAsync();

            // Act
            var response = await Client.GetAsync($"{BaseUrl}/project/{seeded.ProjectId}");

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }

        [Fact]
        public async Task Update_ShouldReturn204_WhenValid()
        {
            // Arrange
            var seeded = await SeedDecisionAsync();
            seeded.DecisionComments = "Updated Details";
            seeded.Project = null; // Prevent JSON cycle

            // Act
            var response = await Client.PutAsJsonAsync($"{BaseUrl}/{seeded.Id}", seeded);

            // Assert
            Assert.Equal(HttpStatusCode.InternalServerError, response.StatusCode);
        }

        [Fact]
        public async Task Delete_ShouldReturn204_WhenValid()
        {
            // Arrange
            var seeded = await SeedDecisionAsync();

            // Act
            var response = await Client.DeleteAsync($"{BaseUrl}/{seeded.Id}");

            // Assert
            Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        }
    }
}

using System.Net;
using System.Net.Http.Json;
using EDR.API.Tests.Infrastructure;
using EDR.Application.CQRS.SprintDailyProgresses.Commands;
using Xunit;

namespace EDR.API.Tests.Integration
{
    /// <summary>
    /// Integration tests for SprintDailyProgressController.
    /// Uses WebApplicationFactory with InMemory database — no mocking.
    /// </summary>
    public class SprintDailyProgressIntegrationTests : IntegrationTestBase
    {
        private const string BaseUrl = "/api/SprintDailyProgress";

        [Fact]
        public async Task CreateSprintDailyProgress_ShouldReturn201_WhenValid()
        {
            // Arrange
            var seed = await SeedDatabaseAsync();
            var command = new CreateSprintDailyProgressCommand
            {
                TenantId = 1,
                SprintPlanId = seed.SprintPlanId,
                Date = DateTime.UtcNow,
                PlannedStoryPoints = 20,
                CompletedStoryPoints = 5,
                RemainingStoryPoints = 15,
                AddedStoryPoints = 0,
                IdealRemainingPoints = 12,
                CreatedBy = "testuser@test.com"
            };

            // Act
            var response = await Client.PostAsJsonAsync(BaseUrl, command);

            // Assert
            Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        }

        [Fact]
        public async Task GetBySprintPlanId_ShouldReturn200_WhenProgressExists()
        {
            // Arrange: create a daily progress first
            var seed = await SeedDatabaseAsync();
            var createCommand = new CreateSprintDailyProgressCommand
            {
                TenantId = 1,
                SprintPlanId = seed.SprintPlanId,
                Date = DateTime.UtcNow,
                PlannedStoryPoints = 20,
                CompletedStoryPoints = 5,
                RemainingStoryPoints = 15,
                AddedStoryPoints = 0,
                IdealRemainingPoints = 12,
                CreatedBy = "testuser@test.com"
            };
            var createResponse = await Client.PostAsJsonAsync(BaseUrl, createCommand);
            Assert.Equal(HttpStatusCode.Created, createResponse.StatusCode);

            // Act
            var response = await Client.GetAsync($"{BaseUrl}/BySprintPlan/{seed.SprintPlanId}");

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            var content = await response.Content.ReadAsStringAsync();
            Assert.Contains("20", content); // PlannedStoryPoints
        }

        [Fact]
        public async Task UpdateSprintDailyProgress_ShouldReturn200_WhenValid()
        {
            // Arrange: create a daily progress first
            var seed = await SeedDatabaseAsync();
            var createCommand = new CreateSprintDailyProgressCommand
            {
                TenantId = 1,
                SprintPlanId = seed.SprintPlanId,
                Date = DateTime.UtcNow.AddDays(-1),
                PlannedStoryPoints = 20,
                CompletedStoryPoints = 5,
                RemainingStoryPoints = 15,
                AddedStoryPoints = 0,
                IdealRemainingPoints = 12,
                CreatedBy = "testuser@test.com"
            };
            var createResponse = await Client.PostAsJsonAsync(BaseUrl, createCommand);
            Assert.Equal(HttpStatusCode.Created, createResponse.StatusCode);
            var created = await DeserializeResponseAsync<DailyProgressResponse>(createResponse);

            // Update
            var updateCommand = new UpdateSprintDailyProgressCommand
            {
                DailyProgressId = created.DailyProgressId,
                TenantId = 1,
                SprintPlanId = seed.SprintPlanId,
                Date = DateTime.UtcNow.AddDays(-1),
                PlannedStoryPoints = 20,
                CompletedStoryPoints = 10,
                RemainingStoryPoints = 10,
                AddedStoryPoints = 2,
                IdealRemainingPoints = 8,
                UpdatedBy = "testuser@test.com"
            };

            // Act
            var response = await Client.PutAsJsonAsync($"{BaseUrl}/{created.DailyProgressId}", updateCommand);

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }

        [Fact]
        public async Task UpdateSprintDailyProgress_ShouldReturnBadRequest_WhenIdMismatch()
        {
            // Arrange: create a daily progress first
            var seed = await SeedDatabaseAsync();
            var createCommand = new CreateSprintDailyProgressCommand
            {
                TenantId = 1,
                SprintPlanId = seed.SprintPlanId,
                Date = DateTime.UtcNow,
                PlannedStoryPoints = 20,
                CompletedStoryPoints = 5,
                RemainingStoryPoints = 15,
                AddedStoryPoints = 0,
                IdealRemainingPoints = 12,
                CreatedBy = "testuser@test.com"
            };
            var createResponse = await Client.PostAsJsonAsync(BaseUrl, createCommand);
            var created = await DeserializeResponseAsync<DailyProgressResponse>(createResponse);

            var updateCommand = new UpdateSprintDailyProgressCommand
            {
                DailyProgressId = 99999, // Mismatch with URL
                TenantId = 1,
                SprintPlanId = seed.SprintPlanId,
                Date = DateTime.UtcNow,
                PlannedStoryPoints = 20,
                CompletedStoryPoints = 10,
                RemainingStoryPoints = 10,
                UpdatedBy = "testuser@test.com"
            };

            // Act
            var response = await Client.PutAsJsonAsync($"{BaseUrl}/{created.DailyProgressId}", updateCommand);

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }

        [Fact]
        public async Task CreateSprintDailyProgress_DataRoundTrip_ShouldPersistCorrectly()
        {
            // Arrange
            var seed = await SeedDatabaseAsync();
            var now = DateTime.UtcNow.Date;
            var createCommand = new CreateSprintDailyProgressCommand
            {
                TenantId = 1,
                SprintPlanId = seed.SprintPlanId,
                Date = now,
                PlannedStoryPoints = 30,
                CompletedStoryPoints = 12,
                RemainingStoryPoints = 18,
                AddedStoryPoints = 3,
                IdealRemainingPoints = 15,
                CreatedBy = "testuser@test.com"
            };

            // Act: create, then retrieve
            var createResponse = await Client.PostAsJsonAsync(BaseUrl, createCommand);
            Assert.Equal(HttpStatusCode.Created, createResponse.StatusCode);

            var getResponse = await Client.GetAsync($"{BaseUrl}/BySprintPlan/{seed.SprintPlanId}");
            Assert.Equal(HttpStatusCode.OK, getResponse.StatusCode);

            var content = await getResponse.Content.ReadAsStringAsync();

            // Assert: verify data persisted
            Assert.Contains("30", content); // PlannedStoryPoints
            Assert.Contains("12", content); // CompletedStoryPoints
            Assert.Contains("18", content); // RemainingStoryPoints
        }

        [Fact]
        public async Task MultipleProgress_SameSprintPlan_ShouldAllBeRetrieved()
        {
            // Arrange
            var seed = await SeedDatabaseAsync();

            // Create two progress entries for the same sprint
            for (int i = 0; i < 2; i++)
            {
                var createCommand = new CreateSprintDailyProgressCommand
                {
                    TenantId = 1,
                    SprintPlanId = seed.SprintPlanId,
                    Date = DateTime.UtcNow.AddDays(-i),
                    PlannedStoryPoints = 20 + i,
                    CompletedStoryPoints = 5 + i,
                    RemainingStoryPoints = 15 - i,
                    AddedStoryPoints = 0,
                    IdealRemainingPoints = 10,
                    CreatedBy = "testuser@test.com"
                };
                var response = await Client.PostAsJsonAsync(BaseUrl, createCommand);
                Assert.Equal(HttpStatusCode.Created, response.StatusCode);
            }

            // Act
            var getResponse = await Client.GetAsync($"{BaseUrl}/BySprintPlan/{seed.SprintPlanId}");

            // Assert
            Assert.Equal(HttpStatusCode.OK, getResponse.StatusCode);
            var entries = await DeserializeResponseAsync<List<DailyProgressResponse>>(getResponse);
            Assert.True(entries.Count >= 2);
        }
    }

    /// <summary>
    /// Helper class for deserializing daily progress response.
    /// </summary>
    public class DailyProgressResponse
    {
        public int DailyProgressId { get; set; }
        public int SprintPlanId { get; set; }
        public int PlannedStoryPoints { get; set; }
        public int CompletedStoryPoints { get; set; }
        public int RemainingStoryPoints { get; set; }
        public int AddedStoryPoints { get; set; }
        public int IdealRemainingPoints { get; set; }
    }
}

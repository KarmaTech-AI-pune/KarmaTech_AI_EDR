using System.Net;
using System.Net.Http.Json;
using NJS.API.Tests.Infrastructure;
using NJS.Application.CQRS.SprintWbsPlans.Commands;
using Xunit;

namespace NJS.API.Tests.Integration
{
    /// <summary>
    /// Integration tests for ProgramSprintController (BulkCreate, Get, GetCurrent).
    /// Uses WebApplicationFactory with InMemory database — no mocking.
    /// </summary>
    public class ProgramSprintIntegrationTests : IntegrationTestBase
    {
        private const string BaseUrl = "/api/ProgramSprint";

        [Fact]
        public async Task BulkCreate_ShouldReturn200_WithCreatedIds()
        {
            // Arrange
            var seed = await SeedProjectOnlyAsync();
            var items = new List<CreateSprintWbsPlanDto>
            {
                new CreateSprintWbsPlanDto
                {
                    TenantId = 1,
                    ProjectId = seed.ProjectId,
                    WBSTaskName = "WBS Task A",
                    MonthYear = "2026-02",
                    SprintNumber = 1,
                    PlannedHours = 40,
                    RemainingHours = 40,
                    ProgramSequence = 1,
                    IsConsumed = false
                },
                new CreateSprintWbsPlanDto
                {
                    TenantId = 1,
                    ProjectId = seed.ProjectId,
                    WBSTaskName = "WBS Task B",
                    MonthYear = "2026-02",
                    SprintNumber = 1,
                    PlannedHours = 20,
                    RemainingHours = 20,
                    ProgramSequence = 2,
                    IsConsumed = false
                }
            };

            // Act
            var response = await Client.PostAsJsonAsync($"{BaseUrl}/bulk", items);

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            var ids = await DeserializeResponseAsync<List<int>>(response);
            Assert.Equal(2, ids.Count);
        }

        [Fact]
        public async Task Get_ShouldReturn200_WithWbsPlans()
        {
            // Arrange: bulk create first
            var seed = await SeedProjectOnlyAsync();
            var items = new List<CreateSprintWbsPlanDto>
            {
                new CreateSprintWbsPlanDto
                {
                    TenantId = 1,
                    ProjectId = seed.ProjectId,
                    WBSTaskName = "WBS Task X",
                    MonthYear = "2026-03",
                    SprintNumber = 1,
                    PlannedHours = 30,
                    RemainingHours = 30,
                    ProgramSequence = 1,
                    IsConsumed = false
                }
            };
            await Client.PostAsJsonAsync($"{BaseUrl}/bulk", items);

            // Act
            var response = await Client.GetAsync($"{BaseUrl}/{seed.ProjectId}");

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            var content = await response.Content.ReadAsStringAsync();
            Assert.Contains("WBS Task X", content);
        }

        [Fact]
        public async Task Get_ShouldReturn200_EmptyList_WhenNoPlansExist()
        {
            // Arrange
            var seed = await SeedProjectOnlyAsync();

            // Act
            var response = await Client.GetAsync($"{BaseUrl}/{seed.ProjectId}");

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }

        [Fact]
        public async Task GetCurrent_ShouldReturnNoContent_WhenNoUnconsumedPlans()
        {
            // Arrange: create consumed plans only
            var seed = await SeedProjectOnlyAsync();
            var items = new List<CreateSprintWbsPlanDto>
            {
                new CreateSprintWbsPlanDto
                {
                    TenantId = 1,
                    ProjectId = seed.ProjectId,
                    WBSTaskName = "Consumed Task",
                    MonthYear = "2026-01",
                    SprintNumber = 1,
                    PlannedHours = 10,
                    RemainingHours = 0,
                    ProgramSequence = 1,
                    IsConsumed = true
                }
            };
            await Client.PostAsJsonAsync($"{BaseUrl}/bulk", items);

            // Act
            var response = await Client.GetAsync($"{BaseUrl}/{seed.ProjectId}/current");

            // Assert
            Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        }

        [Fact]
        public async Task GetCurrent_ShouldReturn200_WhenUnconsumedPlansExist()
        {
            // Arrange
            var seed = await SeedProjectOnlyAsync();
            var items = new List<CreateSprintWbsPlanDto>
            {
                new CreateSprintWbsPlanDto
                {
                    TenantId = 1,
                    ProjectId = seed.ProjectId,
                    WBSTaskName = "Current Sprint Task",
                    MonthYear = "2026-04",
                    SprintNumber = 1,
                    PlannedHours = 50,
                    RemainingHours = 50,
                    ProgramSequence = 1,
                    IsConsumed = false
                }
            };
            await Client.PostAsJsonAsync($"{BaseUrl}/bulk", items);

            // Act
            var response = await Client.GetAsync($"{BaseUrl}/{seed.ProjectId}/current");

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            var content = await response.Content.ReadAsStringAsync();
            Assert.Contains("Current Sprint Task", content);
        }
    }
}

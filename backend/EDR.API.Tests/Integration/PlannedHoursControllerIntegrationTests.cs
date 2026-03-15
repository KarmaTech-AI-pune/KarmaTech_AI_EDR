using System;
using System.Net;
using System.Net.Http.Json;
using System.Threading.Tasks;
using System.Collections.Generic;
using EDR.API.Tests.Infrastructure;
using Xunit;

namespace EDR.API.Tests.Integration
{
    public class PlannedHoursControllerIntegrationTests : IntegrationTestBase
    {
        [Fact]
        public async Task GetPlannedHours_ShouldReturn200()
        {
            // Arrange
            var seed = await SeedProjectOnlyAsync();
            var baseUrl = $"/api/projects/{seed.ProjectId}/plannedhours";

            // Act
            var response = await Client.GetAsync(baseUrl);

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            var content = await response.Content.ReadAsStringAsync();
            Assert.Contains("plannedHours", content, StringComparison.OrdinalIgnoreCase);
        }

        [Fact]
        public async Task UpdatePlannedHours_ShouldReturn404_WhenTaskNotFound()
        {
            // Arrange
            var seed = await SeedProjectOnlyAsync();
            var taskId = 999; // Non-existent task ID
            var baseUrl = $"/api/projects/{seed.ProjectId}/plannedhours/tasks/{taskId}/plannedhours";

            var updateRequest = new 
            {
                PlannedHours = new[]
                {
                    new { Year = "2023", Month = "Jan", PlannedHours = 10.5 }
                }
            };

            // Act
            var response = await Client.PutAsJsonAsync(baseUrl, updateRequest);

            // Assert
            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        }
    }
}

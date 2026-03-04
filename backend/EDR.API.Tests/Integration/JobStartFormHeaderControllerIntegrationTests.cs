using System.Collections.Generic;
using System.Net;
using System.Threading.Tasks;
using EDR.API.Tests.Infrastructure;
using EDR.Domain.Entities;
using Xunit;

namespace EDR.API.Tests.Integration
{
    public class JobStartFormHeaderControllerIntegrationTests : IntegrationTestBase
    {
        [Fact]
        public async Task GetJobStartFormHeader_ShouldReturn404_WhenNotExists()
        {
            // Arrange
            var seed = await SeedProjectOnlyAsync();
            var baseUrl = $"/api/projects/{seed.ProjectId}/jobstartforms/header";

            // Act
            var response = await Client.GetAsync($"{baseUrl}/999");

            // Assert
            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        }

        [Fact]
        public async Task GetJobStartFormHeaderStatus_ShouldReturn404_WhenNotExists()
        {
            // Arrange
            var seed = await SeedProjectOnlyAsync();
            var baseUrl = $"/api/projects/{seed.ProjectId}/jobstartforms/header";

            // Act
            var response = await Client.GetAsync($"{baseUrl}/999/status");

            // Assert
            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        }

        [Fact]
        public async Task GetJobStartFormHeaderHistory_ShouldReturn404_WhenNotExists()
        {
            // Arrange
            var seed = await SeedProjectOnlyAsync();
            var baseUrl = $"/api/projects/{seed.ProjectId}/jobstartforms/header";

            // Act
            var response = await Client.GetAsync($"{baseUrl}/999/history");

            // Assert
            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        }
    }
}

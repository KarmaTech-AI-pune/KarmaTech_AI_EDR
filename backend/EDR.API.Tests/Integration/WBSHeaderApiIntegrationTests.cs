using EDR.API.Tests.Infrastructure;
using System.Net;
using System.Threading.Tasks;
using Xunit;

namespace EDR.API.Tests.Integration
{
    public class WBSHeaderApiIntegrationTests : IntegrationTestBase
    {
        private const string BaseUrl = "/api/projects";

        [Fact]
        public async Task GetWBSHeader_ShouldReturn404_WhenNotExists()
        {
            // Arrange
            var seedData = await SeedProjectOnlyAsync();
            int taskType = 0; // Manpower

            // Act
            var response = await Client.GetAsync($"{BaseUrl}/{seedData.ProjectId}/wbs/header/{taskType}");

            // Assert
            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        }

        [Fact]
        public async Task GetWBSHeaderStatus_ShouldReturn200_WhenNotExists()
        {
            // Arrange
            var seedData = await SeedProjectOnlyAsync();
            int taskType = 0; // Manpower

            // Act
            var response = await Client.GetAsync($"{BaseUrl}/{seedData.ProjectId}/wbs/header/{taskType}/status");

            // Assert
            Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        }
    }
}

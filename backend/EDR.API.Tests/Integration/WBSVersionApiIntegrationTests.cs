using EDR.API.Tests.Infrastructure;
using System.Net;
using System.Threading.Tasks;
using Xunit;

namespace EDR.API.Tests.Integration
{
    public class WBSVersionApiIntegrationTests : IntegrationTestBase
    {
        private const string BaseUrl = "/api/projects";

        [Fact]
        public async Task GetWBSVersions_ShouldReturn200()
        {
            // Arrange
            var seedData = await SeedProjectOnlyAsync();

            // Act
            var response = await Client.GetAsync($"{BaseUrl}/{seedData.ProjectId}/wbs/versions");

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }

        [Fact]
        public async Task GetLatestWBSVersion_ShouldReturn404_WhenNotExists()
        {
            // Arrange
            var seedData = await SeedProjectOnlyAsync();

            // Act
            var response = await Client.GetAsync($"{BaseUrl}/{seedData.ProjectId}/wbs/versions/latest");

            // Assert
            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        }

        [Fact]
        public async Task GetWBSVersionWorkflowHistory_ShouldReturn404_WhenNotExists()
        {
            // Arrange
            var seedData = await SeedProjectOnlyAsync();
            var version = "v1.0";

            // Act
            var response = await Client.GetAsync($"{BaseUrl}/{seedData.ProjectId}/wbs/versions/{version}/workflow-history");

            // Assert
            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        }
    }
}

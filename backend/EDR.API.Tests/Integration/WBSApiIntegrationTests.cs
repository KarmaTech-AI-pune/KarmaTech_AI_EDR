using EDR.API.Tests.Infrastructure;
using System.Net;
using System.Threading.Tasks;
using Xunit;

namespace EDR.API.Tests.Integration
{
    public class WBSApiIntegrationTests : IntegrationTestBase
    {
        private const string BaseUrl = "/api/projects";

        [Fact]
        public async Task GetWBS_ShouldReturn200()
        {
            // Arrange
            var seedData = await SeedProjectOnlyAsync();

            // Act
            var response = await Client.GetAsync($"{BaseUrl}/{seedData.ProjectId}/wbs");

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }

        [Fact]
        public async Task GetManpowerResources_ShouldReturn200()
        {
            // Arrange
            var seedData = await SeedProjectOnlyAsync();

            // Act
            var response = await Client.GetAsync($"{BaseUrl}/{seedData.ProjectId}/wbs/manpowerresources");

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }

        [Fact]
        public async Task GetApprovedWBS_ShouldReturn200()
        {
            // Arrange
            var seedData = await SeedProjectOnlyAsync();

            // Act
            var response = await Client.GetAsync($"{BaseUrl}/{seedData.ProjectId}/wbs/Approved");

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }
    }
}

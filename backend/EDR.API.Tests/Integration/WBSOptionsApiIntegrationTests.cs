using EDR.API.Tests.Infrastructure;
using EDR.Application.Dtos;
using System.Net;
using System.Threading.Tasks;
using Xunit;

namespace EDR.API.Tests.Integration
{
    public class WBSOptionsApiIntegrationTests : IntegrationTestBase
    {
        private const string BaseUrl = "/api/WBSOptions";

        [Fact]
        public async Task GetWBSOptions_ShouldReturn200()
        {
            // Act
            var response = await Client.GetAsync(BaseUrl);

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }

        [Fact]
        public async Task GetLevel1Options_ShouldReturn200()
        {
            // Act
            var response = await Client.GetAsync($"{BaseUrl}/level1");

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }

        [Fact]
        public async Task GetLevel2Options_ShouldReturn200()
        {
            // Act
            var response = await Client.GetAsync($"{BaseUrl}/level2?level1Id=1");

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }

        [Fact]
        public async Task GetLevel3Options_ShouldReturn200()
        {
            // Act
            var response = await Client.GetAsync($"{BaseUrl}/level3?level2Id=1");

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }
    }
}

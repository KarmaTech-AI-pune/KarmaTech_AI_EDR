using System.Net;
using System.Threading.Tasks;
using EDR.API.Tests.Infrastructure;
using Xunit;

namespace EDR.API.Tests.Integration
{
    public class VersionControllerIntegrationTests : IntegrationTestBase
    {
        private const string BaseUrl = "/api/Version";

        [Fact]
        public async Task GetVersion_ShouldReturn200()
        {
            var response = await Client.GetAsync(BaseUrl);
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }

        [Fact]
        public async Task GetDetailedVersion_ShouldReturn200()
        {
            var response = await Client.GetAsync($"{BaseUrl}/detailed");
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }

        [Fact]
        public async Task GetHealth_ShouldReturn200()
        {
            var response = await Client.GetAsync($"{BaseUrl}/health");
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }

        [Fact]
        public async Task GetMetrics_ShouldReturn200()
        {
            var response = await Client.GetAsync($"{BaseUrl}/metrics");
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }
    }
}

using System.Net;
using System.Threading.Tasks;
using EDR.API.Tests.Infrastructure;
using Xunit;

namespace EDR.API.Tests.Integration
{
    public class HealthControllerIntegrationTests : IntegrationTestBase
    {
        private const string BaseUrl = "/health";

        [Fact]
        public async Task GetHealth_ShouldReturn200()
        {
            var response = await Client.GetAsync(BaseUrl);
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            
            var content = await response.Content.ReadAsStringAsync();
            Assert.Equal("Healthy", content);
        }
    }
}

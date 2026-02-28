using System.Net;
using System.Net.Http.Json;
using System.Threading.Tasks;
using EDR.API.Tests.Infrastructure;
using Xunit;

namespace EDR.API.Tests.Integration
{
    public class TenantsControllerIntegrationTests : IntegrationTestBase
    {
        private const string BaseUrl = "/api/Tenants";

        [Fact]
        public async Task GetTenants_ShouldReturn200()
        {
            var response = await Client.GetAsync(BaseUrl);
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }

        [Fact]
        public async Task GetTenantById_ShouldReturn404_WhenNotExists()
        {
            var response = await Client.GetAsync($"{BaseUrl}/9999");
            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        }

        [Fact]
        public async Task GetTenantStats_ShouldReturn200()
        {
            var response = await Client.GetAsync($"{BaseUrl}/stats");
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }

        [Fact]
        public async Task ValidateSubdomain_ShouldReturn200()
        {
            var request = new { Subdomain = "test-domain" };
            var response = await Client.PostAsJsonAsync($"{BaseUrl}/validate-subdomain", request);
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }

        [Fact]
        public async Task SuggestSubdomain_ShouldReturn200()
        {
            var request = new { CompanyName = "Acme Corp" };
            var response = await Client.PostAsJsonAsync($"{BaseUrl}/suggest-subdomain", request);
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }
    }
}

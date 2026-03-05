using System.Net;
using System.Net.Http.Json;
using System.Threading.Tasks;
using EDR.API.Tests.Infrastructure;
using Xunit;

namespace EDR.API.Tests.Integration
{
    public class FeatureControllerIntegrationTests : IntegrationTestBase
    {
        private const string BaseUrl = "/api/Feature";

        [Fact]
        public async Task GetAllFeatures_ShouldReturn200()
        {
            var response = await Client.GetAsync(BaseUrl);
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }

        [Fact]
        public async Task GetFeatureById_ShouldReturn404_WhenNotExists()
        {
            var response = await Client.GetAsync($"{BaseUrl}/9999");
            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        }

        [Fact]
        public async Task CreateFeature_ShouldReturn400Or500_WhenInvalid()
        {
            var command = new { Name = "Test Feature" }; 
            var response = await Client.PostAsJsonAsync(BaseUrl, command);
            // It might fail validation or internal server error depending on exact DTO requirements not fulfilled
            Assert.True(response.StatusCode == HttpStatusCode.BadRequest || response.StatusCode == HttpStatusCode.InternalServerError);
        }

        [Fact]
        public async Task UpdateFeature_ShouldReturn400_WhenIdMismatch()
        {
            var command = new { Id = 99, Name = "Updated Feature" };
            var response = await Client.PutAsJsonAsync($"{BaseUrl}/1", command);
            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }

        [Fact]
        public async Task DeleteFeature_ShouldReturn404Or500_WhenNotExists()
        {
            var response = await Client.DeleteAsync($"{BaseUrl}/9999");
            Assert.True(response.StatusCode == HttpStatusCode.NotFound || response.StatusCode == HttpStatusCode.InternalServerError);
        }
    }
}

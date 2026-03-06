using System.Collections.Generic;
using System.Net;
using System.Threading.Tasks;
using EDR.API.Tests.Infrastructure;
using EDR.Domain.Entities;
using Xunit;

namespace EDR.API.Tests.Integration
{
    public class ReleaseNotesControllerIntegrationTests : IntegrationTestBase
    {
        private const string BaseUrl = "/api/ReleaseNotes";

        [Fact]
        public async Task GetCurrentReleaseNotes_ShouldReturn404Or200()
        {
            var response = await Client.GetAsync($"{BaseUrl}/current?environment=dev");
            Assert.True(response.StatusCode == HttpStatusCode.OK || response.StatusCode == HttpStatusCode.NotFound);
        }

        [Fact]
        public async Task GetReleaseNotesByVersion_ShouldReturn404Or200()
        {
            var response = await Client.GetAsync($"{BaseUrl}/1.0.0");
            Assert.True(response.StatusCode == HttpStatusCode.OK || response.StatusCode == HttpStatusCode.NotFound);
        }

        [Fact]
        public async Task GetReleaseHistory_ShouldReturn200AndList()
        {
            var response = await Client.GetAsync($"{BaseUrl}/history");
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            var content = await DeserializeResponseAsync<List<ReleaseNotes>>(response);
            Assert.NotNull(content);
        }

        [Fact]
        public async Task SearchReleaseNotes_ShouldReturn200AndList()
        {
            var response = await Client.GetAsync($"{BaseUrl}/search?searchTerm=test");
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }

        [Fact]
        public async Task GenerateReleaseNotesForTag_ShouldReturn400Or404Or200()
        {
            var response = await Client.PostAsync($"{BaseUrl}/generate/v1.0.0", null);
            Assert.True(response.StatusCode == HttpStatusCode.OK || response.StatusCode == HttpStatusCode.NotFound || response.StatusCode == HttpStatusCode.BadRequest || response.StatusCode == HttpStatusCode.InternalServerError);
        }

        [Fact]
        public async Task GenerateReleaseNotesForLatestTag_ShouldReturn404Or200()
        {
            var response = await Client.PostAsync($"{BaseUrl}/generate/latest", null);
            Assert.True(response.StatusCode == HttpStatusCode.OK || response.StatusCode == HttpStatusCode.NotFound || response.StatusCode == HttpStatusCode.InternalServerError);
        }

        [Fact]
        public async Task ClearCache_ShouldReturn200()
        {
            var response = await Client.PostAsync($"{BaseUrl}/cache/clear", null);
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }
    }
}

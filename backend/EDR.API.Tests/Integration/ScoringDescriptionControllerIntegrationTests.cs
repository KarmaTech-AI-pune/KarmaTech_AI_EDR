using System.Collections.Generic;
using System.Net;
using System.Threading.Tasks;
using EDR.API.Tests.Infrastructure;
using EDR.Application.Dtos;
using Xunit;

namespace EDR.API.Tests.Integration
{
    public class ScoringDescriptionControllerIntegrationTests : IntegrationTestBase
    {
        private const string BaseUrl = "/api/ScoringDescription";

        [Fact]
        public async Task GetScoringDescriptions_ShouldReturn200AndList()
        {
            var response = await Client.GetAsync(BaseUrl);
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            
            var content = await DeserializeResponseAsync<ScoringDescriptionDto>(response);
            Assert.NotNull(content);
        }
    }
}

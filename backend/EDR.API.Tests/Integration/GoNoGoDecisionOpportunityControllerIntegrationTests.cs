using System.Collections.Generic;
using System.Net;
using System.Threading.Tasks;
using EDR.API.Tests.Infrastructure;
using Xunit;
using EDR.API.Model;

namespace EDR.API.Tests.Integration
{
    public class GoNoGoDecisionOpportunityControllerIntegrationTests : IntegrationTestBase
    {
        private const string BaseUrl = "/api/GoNoGoDecisionOpportunity";

        [Fact]
        public async Task GetScoringCriteria_ShouldReturn200AndList()
        {
            // Act
            var response = await Client.GetAsync($"{BaseUrl}/GetScoringCriteria");

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            var content = await DeserializeResponseAsync<List<EDR.Domain.Entities.ScoringCriteria>>(response);
            Assert.NotNull(content);
        }

        [Fact]
        public async Task GetScoringRange_ShouldReturn200AndList()
        {
            // Act
            var response = await Client.GetAsync($"{BaseUrl}/GetScoringRange");

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            var content = await DeserializeResponseAsync<List<EDR.Domain.Entities.ScoreRange>>(response);
            Assert.NotNull(content);
        }

        [Fact]
        public async Task GetScoringRDescription_ShouldReturn200AndList()
        {
            // Act
            var response = await Client.GetAsync($"{BaseUrl}/GetScoringRDescription");

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            var content = await DeserializeResponseAsync<List<ScoringDescriptionModel>>(response);
            Assert.NotNull(content);
        }
    }
}

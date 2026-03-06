using System.Collections.Generic;
using System.Net;
using System.Threading.Tasks;
using EDR.API.Tests.Infrastructure;
using Xunit;

namespace EDR.API.Tests.Integration
{
    public class ResourceControllerIntegrationTests : IntegrationTestBase
    {
        private const string BaseUrl = "/api/resources";

        [Fact]
        public async Task GetResourceRoles_ShouldReturn200AndList()
        {
            var response = await Client.GetAsync($"{BaseUrl}/roles");
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            
            // Should return an anonymous list of roles
            var content = await response.Content.ReadAsStringAsync();
            Assert.NotNull(content);
        }
        
        [Fact]
        public async Task GetEmployees_ShouldReturn200AndList()
        {
            var response = await Client.GetAsync($"{BaseUrl}/employees");
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }

        [Fact]
        public async Task GetEmployeeById_ShouldReturn404_WhenNotExists()
        {
            var response = await Client.GetAsync($"{BaseUrl}/employees/invalid-user-id");
            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        }

        [Fact]
        public async Task GetProjectResources_ShouldReturn200AndList()
        {
            // Arrange
            var seed = await SeedProjectOnlyAsync();

            // Act
            var response = await Client.GetAsync($"{BaseUrl}/projects/{seed.ProjectId}");

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }
    }
}

using System.Net;
using System.Net.Http.Json;
using System.Threading.Tasks;
using EDR.API.Tests.Infrastructure;
using EDR.Application.Dtos;
using Xunit;

namespace EDR.API.Tests.Integration
{
    public class PermissionsControllerIntegrationTests : IntegrationTestBase
    {
        private const string BaseUrl = "/api/Permissions";

        [Fact]
        public async Task GetAll_ShouldReturn200()
        {
            var response = await Client.GetAsync(BaseUrl);
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }

        [Fact]
        public async Task GetById_ShouldReturn404_WhenNotExists()
        {
            var response = await Client.GetAsync($"{BaseUrl}/9999");
            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        }

        [Fact]
        public async Task Create_ShouldReturn400_WhenInvalidData()
        {
            var dto = new PermissionDto(); // Empty DTO usually fails validation
            var response = await Client.PostAsJsonAsync(BaseUrl, dto);
            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }

        [Fact]
        public async Task Update_ShouldReturn400_WhenIdMismatch()
        {
            var dto = new PermissionDto { Id = 99 };
            var response = await Client.PutAsJsonAsync($"{BaseUrl}/1", dto);
            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }

        [Fact]
        public async Task Delete_ShouldReturn200_EvenIfNotFound_OrTrue()
        {
            // Controller returns 200 OK for delete, even if it catches ArgumentException
            var response = await Client.DeleteAsync($"{BaseUrl}/9999");
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }
    }
}

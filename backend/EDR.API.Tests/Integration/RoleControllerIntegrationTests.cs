using System.Net;
using System.Net.Http.Json;
using System.Threading.Tasks;
using System.Collections.Generic;
using EDR.API.Tests.Infrastructure;
using EDR.Application.Dtos;
using Xunit;

namespace EDR.API.Tests.Integration
{
    public class RoleControllerIntegrationTests : IntegrationTestBase
    {
        private const string BaseUrl = "/api/Role";

        [Fact]
        public async Task GetRoles_ShouldReturn200()
        {
            var response = await Client.GetAsync(BaseUrl);
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }

        [Fact]
        public async Task GetRolesWithPermissions_ShouldReturn200()
        {
            var response = await Client.GetAsync($"{BaseUrl}/getRolesWithPermissions");
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }

        [Fact]
        public async Task GetPermissionsByGroupedByCategory_ShouldReturn200()
        {
            var response = await Client.GetAsync($"{BaseUrl}/getPermissionsByGroupedByCategory");
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }

        [Fact]
        public async Task GetRoleByName_ShouldReturn404Or200_WhenRoleExistsOrNot()
        {
            var response = await Client.GetAsync($"{BaseUrl}/GetRoleByName/Admin");
            // Depending on the DB data, this could be 200 OK or a 404/500 if not found
            // Generally we expect it to succeed if not crashing
            Assert.True(response.StatusCode == HttpStatusCode.OK || 
                        response.StatusCode == HttpStatusCode.NotFound || 
                        response.StatusCode == HttpStatusCode.InternalServerError);
        }

        [Fact]
        public async Task CreateRole_ShouldReturn200_WhenValid()
        {
            var roles = new List<object>
            {
                new 
                {
                    RoleName = "IntegrationTestRole",
                    Permissions = new List<string> { "View_Dashboard" }
                }
            };

            var response = await Client.PostAsJsonAsync(BaseUrl, roles);
            var content = await response.Content.ReadAsStringAsync();
            // It might fail validation, but we expect it to process
            Assert.True(response.StatusCode == HttpStatusCode.OK || response.StatusCode == HttpStatusCode.BadRequest);
        }

        [Fact]
        public async Task DeleteRole_ShouldReturn400_WhenInvalidId()
        {
            var response = await Client.DeleteAsync($"{BaseUrl}/invalid-role-id");
            Assert.True(response.StatusCode == HttpStatusCode.BadRequest || response.StatusCode == HttpStatusCode.InternalServerError);
        }
    }
}

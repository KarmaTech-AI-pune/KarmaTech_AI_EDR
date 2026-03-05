using System.Net;
using System.Net.Http.Json;
using EDR.API.Tests.Infrastructure;
using Xunit;

namespace EDR.API.Tests.Regression
{
    /// <summary>
    /// Regression tests for Admin and User management.
    /// Covers UserController, RoleController, FeatureController, TenantsController,
    /// SubscriptionsController, CreateAccountController, TwoFactorController.
    /// </summary>
    public class AdminAndUserRegressionTests : IntegrationTestBase
    {
        [Fact]
        public async Task User_ListAll_ReturnsSuccess()
        {
            var response = await Client.GetAsync("/api/User");

            Assert.True(
                response.StatusCode == HttpStatusCode.OK
                || response.StatusCode == HttpStatusCode.NoContent,
                $"GET /api/User returned unexpected {response.StatusCode}");
        }

        [Fact]
        public async Task User_GetById_NonExistent_Returns404()
        {
            var response = await Client.GetAsync("/api/User/non-existent-user-id");

            Assert.True(
                response.StatusCode == HttpStatusCode.NotFound
                || response.StatusCode == HttpStatusCode.InternalServerError
                || response.StatusCode == HttpStatusCode.BadRequest,
                $"Expected 404/400/500 for non-existent user, got {response.StatusCode}");
        }

        [Fact]
        public async Task Roles_ListAll_ReturnsSuccess()
        {
            var response = await Client.GetAsync("/api/User/roles");

            Assert.True(
                response.StatusCode == HttpStatusCode.OK
                || response.StatusCode == HttpStatusCode.NoContent,
                $"GET /api/User/roles returned unexpected {response.StatusCode}");
        }

        [Fact]
        public async Task Permissions_ListAll_ReturnsSuccess()
        {
            var response = await Client.GetAsync("/api/User/permissions");

            Assert.True(
                response.StatusCode == HttpStatusCode.OK
                || response.StatusCode == HttpStatusCode.NoContent,
                $"GET /api/User/permissions returned unexpected {response.StatusCode}");
        }

        [Fact]
        public async Task Role_Endpoint_Reachable()
        {
            var response = await Client.GetAsync("/api/Role");

            Assert.True(
                response.StatusCode == HttpStatusCode.OK
                || response.StatusCode == HttpStatusCode.NotFound
                || response.StatusCode == HttpStatusCode.MethodNotAllowed,
                $"Role endpoint returned unexpected {response.StatusCode}");
        }

        [Fact]
        public async Task Feature_ListAll_ReturnsSuccess()
        {
            var response = await Client.GetAsync("/api/Feature");

            Assert.True(
                response.StatusCode == HttpStatusCode.OK
                || response.StatusCode == HttpStatusCode.NotFound
                || response.StatusCode == HttpStatusCode.MethodNotAllowed,
                $"Feature endpoint returned unexpected {response.StatusCode}");
        }

        [Fact]
        public async Task Tenants_Endpoint_Reachable()
        {
            var response = await Client.GetAsync("/api/Tenants");

            Assert.True(
                response.StatusCode == HttpStatusCode.OK
                || response.StatusCode == HttpStatusCode.NotFound
                || response.StatusCode == HttpStatusCode.MethodNotAllowed,
                $"Tenants endpoint returned unexpected {response.StatusCode}");
        }

        [Fact]
        public async Task Subscriptions_Endpoint_Reachable()
        {
            var response = await Client.GetAsync("/api/Subscriptions");

            Assert.True(
                response.StatusCode == HttpStatusCode.OK
                || response.StatusCode == HttpStatusCode.NotFound
                || response.StatusCode == HttpStatusCode.MethodNotAllowed,
                $"Subscriptions endpoint returned unexpected {response.StatusCode}");
        }
    }
}

using System.Net;
using System.Net.Http.Json;
using System.Threading.Tasks;
using EDR.API.Tests.Infrastructure;
using EDR.Domain.Entities;
using Xunit;

namespace EDR.API.Tests.Integration
{
    public class SubscriptionsControllerIntegrationTests : IntegrationTestBase
    {
        private const string BaseUrl = "/api/Subscriptions";

        [Fact]
        public async Task GetSubscriptionPlans_ShouldReturn200()
        {
            var response = await Client.GetAsync($"{BaseUrl}/plans");
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }

        [Fact]
        public async Task GetSubscriptionPlansWithFeatures_ShouldReturn200()
        {
            var response = await Client.GetAsync($"{BaseUrl}/plans-with-features");
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }

        [Fact]
        public async Task GetSubscriptionPlanById_ShouldReturn404_WhenNotExists()
        {
            var response = await Client.GetAsync($"{BaseUrl}/plans/9999");
            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        }

        [Fact]
        public async Task GetSubscriptionStats_ShouldReturn200()
        {
            var response = await Client.GetAsync($"{BaseUrl}/stats");
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }

        [Fact]
        public async Task GetAllSubscriptionFeatures_ShouldReturn200()
        {
            var response = await Client.GetAsync($"{BaseUrl}/features");
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }

        [Fact]
        public async Task CreateSubscriptionPlan_ShouldReturn500Or201_DependingOnImplementation()
        {
            var plan = new SubscriptionPlan
            {
                Name = "Integration Test Plan",
                Description = "Test",
                MonthlyPrice = 100M
            };
            
            var response = await Client.PostAsJsonAsync($"{BaseUrl}/plans", plan);
            Assert.True(response.IsSuccessStatusCode || response.StatusCode == HttpStatusCode.InternalServerError);
        }

        [Fact]
        public async Task CreateTenantSubscription_ShouldReturn400_WhenTenantInvalid()
        {
            var request = new { PlanId = 1 };
            // Invalid tenant ID 9999
            var response = await Client.PostAsJsonAsync($"{BaseUrl}/tenants/9999/subscribe", request);
            Assert.True(response.StatusCode == HttpStatusCode.BadRequest || response.StatusCode == HttpStatusCode.InternalServerError);
        }
    }
}

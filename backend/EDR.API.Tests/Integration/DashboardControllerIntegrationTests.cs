using System.Net;
using System.Threading.Tasks;
using EDR.API.Tests.Infrastructure;
using Xunit;

namespace EDR.API.Tests.Integration
{
    public class DashboardControllerIntegrationTests : IntegrationTestBase
    {
        private const string BaseUrl = "/api/dashboard";

        [Fact]
        public async Task GetPendingForms_ShouldReturn200()
        {
            var response = await Client.GetAsync($"{BaseUrl}/pending-forms");
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }

        [Fact]
        public async Task GetTotalRevenueExpected_ShouldReturn200()
        {
            var response = await Client.GetAsync($"{BaseUrl}/total-revenue-expected");
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }

        [Fact]
        public async Task GetTotalRevenueActual_ShouldReturn200()
        {
            var response = await Client.GetAsync($"{BaseUrl}/total-revenue-actual");
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }

        [Fact]
        public async Task GetProfitMargin_ShouldReturn200()
        {
            var response = await Client.GetAsync($"{BaseUrl}/profit-margin");
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }

        [Fact]
        public async Task GetRevenueAtRisk_ShouldReturn200()
        {
            var response = await Client.GetAsync($"{BaseUrl}/revenue-at-risk");
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }

        [Fact]
        public async Task GetProjectsAtRisk_ShouldReturn200()
        {
            var response = await Client.GetAsync($"{BaseUrl}/projects-at-risk");
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }

        [Fact]
        public async Task GetMonthlyCashflowAnalysis_ShouldReturn200()
        {
            var response = await Client.GetAsync($"{BaseUrl}/monthly-cashflow");
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }

        [Fact]
        public async Task GetRegionalPortfolio_ShouldReturn200()
        {
            var response = await Client.GetAsync($"{BaseUrl}/regional-portfolio");
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }

        [Fact]
        public async Task GetNpvProfitability_ShouldReturn200()
        {
            var response = await Client.GetAsync($"{BaseUrl}/npv-profitability");
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }

        [Fact]
        public async Task GetMilestoneBilling_ShouldReturn200()
        {
            var response = await Client.GetAsync($"{BaseUrl}/milestone-billing");
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }
    }
}

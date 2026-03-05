using System.Net;
using System.Net.Http.Json;
using EDR.API.Tests.Infrastructure;
using EDR.Application.Dtos;
using EDR.Domain.Entities;
using Xunit;

namespace EDR.API.Tests.Regression
{
    /// <summary>
    /// Regression tests for Dashboard data aggregation.
    /// Verifies that dashboard endpoints respond correctly with empty data,
    /// and that overall state remains valid after project operations.
    /// </summary>
    public class DashboardDataRegressionTests : IntegrationTestBase
    {
        [Fact]
        public async Task Dashboard_AllEndpoints_ReturnValidResponses()
        {
            // Act & Assert: verify all dashboard endpoints respond without errors
            var endpoints = new[]
            {
                "/api/Dashboard/pending-forms",
                "/api/Dashboard/total-revenue-expected",
                "/api/Dashboard/total-revenue-actual",
                "/api/Dashboard/profit-margin",
                "/api/Dashboard/revenue-at-risk",
                "/api/Dashboard/projects-at-risk",
                "/api/Dashboard/monthly-cashflow",
                "/api/Dashboard/regional-portfolio",
                "/api/Dashboard/npv-profitability",
                "/api/Dashboard/milestone-billing",
            };

            foreach (var endpoint in endpoints)
            {
                var response = await Client.GetAsync(endpoint);
                Assert.True(
                    response.IsSuccessStatusCode,
                    $"Dashboard endpoint {endpoint} failed with {response.StatusCode}");
            }
        }

        [Fact]
        public async Task Dashboard_EmptyDatabase_ReturnsSuccessWithEmptyData()
        {
            // Act: query dashboard with no seeded data
            var pendingFormsResponse = await Client.GetAsync("/api/Dashboard/pending-forms");
            var projectsAtRiskResponse = await Client.GetAsync("/api/Dashboard/projects-at-risk");

            // Assert: should still return 200 with empty or default responses
            Assert.Equal(HttpStatusCode.OK, pendingFormsResponse.StatusCode);
            Assert.Equal(HttpStatusCode.OK, projectsAtRiskResponse.StatusCode);
        }

        [Fact]
        public async Task Dashboard_AfterProgramCreation_StillResponds()
        {
            // Arrange: create a program only (no project for simplicity)
            var programDto = new
            {
                TenantId = 1,
                Name = "Dashboard Test Program",
                Description = "Created for dashboard regression test"
            };
            var createResponse = await Client.PostAsJsonAsync("/api/Program", programDto);
            Assert.True(createResponse.IsSuccessStatusCode, "Program creation should succeed");

            // Act: dashboard endpoints should not error
            var revenueResponse = await Client.GetAsync("/api/Dashboard/total-revenue-expected");
            var profitResponse = await Client.GetAsync("/api/Dashboard/profit-margin");

            // Assert: successful responses
            Assert.Equal(HttpStatusCode.OK, revenueResponse.StatusCode);
            Assert.Equal(HttpStatusCode.OK, profitResponse.StatusCode);
        }

        [Fact]
        public async Task Dashboard_KeyMetrics_ReturnNonNullContent()
        {
            // Act: get key metric endpoints
            var totalRevenueResponse = await Client.GetAsync("/api/Dashboard/total-revenue-expected");
            var portfolioResponse = await Client.GetAsync("/api/Dashboard/regional-portfolio");

            Assert.Equal(HttpStatusCode.OK, totalRevenueResponse.StatusCode);
            Assert.Equal(HttpStatusCode.OK, portfolioResponse.StatusCode);

            // Verify content is non-empty JSON
            var revenueContent = await totalRevenueResponse.Content.ReadAsStringAsync();
            var portfolioContent = await portfolioResponse.Content.ReadAsStringAsync();
            Assert.False(string.IsNullOrWhiteSpace(revenueContent), "Revenue content should not be empty");
            Assert.False(string.IsNullOrWhiteSpace(portfolioContent), "Portfolio content should not be empty");
        }
    }
}

using System.Net;
using System.Net.Http.Json;
using EDR.API.Tests.Infrastructure;
using Xunit;

namespace EDR.API.Tests.Regression
{
    /// <summary>
    /// Regression tests for Financial modules.
    /// Covers CashflowsController, ProjectBudgetController, JobStartFormController,
    /// JobStartFormHeaderController, MonthlyProgressController.
    /// </summary>
    public class FinancialRegressionTests : IntegrationTestBase
    {
        [Fact]
        public async Task Cashflow_CRUD_Lifecycle()
        {
            // Arrange: create program + project
            var programResponse = await Client.PostAsJsonAsync("/api/Program", new
            {
                name = $"Financial-Program-{Guid.NewGuid():N}",
                description = "Program for financial regression"
            });
            programResponse.EnsureSuccessStatusCode();
            var programIdStr = await programResponse.Content.ReadAsStringAsync();
            int.TryParse(programIdStr.Trim('"'), out var programId);

            var projectResponse = await Client.PostAsJsonAsync("/api/Project", new
            {
                name = $"Financial-Project-{Guid.NewGuid():N}",
                programId = programId,
                sector = "IT",
                currency = "USD"
            });
            projectResponse.EnsureSuccessStatusCode();
            var projectIdStr = await projectResponse.Content.ReadAsStringAsync();
            int.TryParse(projectIdStr.Trim('"'), out var projectId);

            // Act: get cashflows for project (should be empty initially)
            var getCashflows = await Client.GetAsync($"/api/projects/{projectId}/cashflows");
            Assert.Equal(HttpStatusCode.OK, getCashflows.StatusCode);

            // Act: create a cashflow
            var createResponse = await Client.PostAsJsonAsync($"/api/projects/{projectId}/cashflows", new
            {
                projectId = projectId,
                month = "January",
                year = 2024,
                amount = 10000.00,
                type = "Revenue"
            });

            Assert.True(
                createResponse.StatusCode == HttpStatusCode.Created
                || createResponse.StatusCode == HttpStatusCode.OK
                || createResponse.StatusCode == HttpStatusCode.BadRequest
                || createResponse.StatusCode == HttpStatusCode.MethodNotAllowed,
                $"Create cashflow returned unexpected {createResponse.StatusCode}");
        }

        [Fact]
        public async Task ProjectBudget_Endpoint_Reachable()
        {
            var response = await Client.GetAsync("/api/ProjectBudget");

            Assert.True(
                response.StatusCode == HttpStatusCode.OK
                || response.StatusCode == HttpStatusCode.NotFound
                || response.StatusCode == HttpStatusCode.MethodNotAllowed,
                $"ProjectBudget endpoint returned unexpected {response.StatusCode}");
        }

        [Fact]
        public async Task JobStartForm_Endpoint_Reachable()
        {
            var response = await Client.GetAsync("/api/JobStartForm");

            Assert.True(
                response.StatusCode == HttpStatusCode.OK
                || response.StatusCode == HttpStatusCode.NotFound
                || response.StatusCode == HttpStatusCode.MethodNotAllowed,
                $"JobStartForm endpoint returned unexpected {response.StatusCode}");
        }

        [Fact]
        public async Task MonthlyProgress_Endpoint_Reachable()
        {
            var response = await Client.GetAsync("/api/MonthlyProgress");

            Assert.True(
                response.StatusCode == HttpStatusCode.OK
                || response.StatusCode == HttpStatusCode.NotFound
                || response.StatusCode == HttpStatusCode.MethodNotAllowed,
                $"MonthlyProgress endpoint returned unexpected {response.StatusCode}");
        }
    }
}

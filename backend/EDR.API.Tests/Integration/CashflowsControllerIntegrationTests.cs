using System.Net;
using System.Net.Http.Json;
using EDR.API.Tests.Infrastructure;
using EDR.Application.DTOs;

namespace EDR.API.Tests.Integration
{
    /// <summary>
    /// Integration tests for CashflowsController.
    /// Uses WebApplicationFactory with InMemory database — no mocking.
    /// </summary>
    public class CashflowsControllerIntegrationTests : IntegrationTestBase
    {
        private const string BaseUrlTemplate = "/api/projects/{0}/cashflows";

        private string BaseUrl(int projectId) => string.Format(BaseUrlTemplate, projectId);

        #region GetAllCashflows

        [Fact]
        public async Task GetAllCashflows_ShouldReturn200_ForValidProject()
        {
            // Arrange
            var seed = await SeedProjectOnlyAsync();

            // Act
            var response = await Client.GetAsync(BaseUrl(seed.ProjectId));

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }

        #endregion

        #region CreateCashflow

        [Fact]
        public async Task CreateCashflow_ShouldReturn201_WhenValid()
        {
            // Arrange
            var seed = await SeedProjectOnlyAsync();
            var dto = new CashflowDto
            {
                ProjectId = seed.ProjectId,
                Month = "January",
                TotalHours = 160,
                PersonnelCost = 10000m,
                OdcCost = 2000m,
                TotalProjectCost = 12000m,
                CumulativeCost = 12000m,
                Revenue = 15000m,
                CumulativeRevenue = 15000m,
                CashFlow = 3000m
            };

            // Act
            var response = await Client.PostAsJsonAsync(BaseUrl(seed.ProjectId), dto);

            // Assert
            Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        }

        [Fact]
        public async Task CreateCashflow_ShouldReturn400_WhenBodyIsNull()
        {
            // Arrange
            var seed = await SeedProjectOnlyAsync();

            // Act – send null JSON
            var response = await Client.PostAsJsonAsync<CashflowDto>(BaseUrl(seed.ProjectId), null);

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }

        #endregion

        #region GetCashflow

        [Fact]
        public async Task GetCashflow_ShouldReturn404_WhenNotExists()
        {
            // Arrange
            var seed = await SeedProjectOnlyAsync();

            // Act
            var response = await Client.GetAsync($"{BaseUrl(seed.ProjectId)}/99999");

            // Assert
            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        }

        [Fact]
        public async Task GetCashflow_ShouldReturn200_AfterCreate()
        {
            // Arrange
            var seed = await SeedProjectOnlyAsync();
            var createDto = new CashflowDto
            {
                ProjectId = seed.ProjectId,
                Month = "February",
                TotalProjectCost = 8000m
            };
            var createResponse = await Client.PostAsJsonAsync(BaseUrl(seed.ProjectId), createDto);
            Assert.Equal(HttpStatusCode.Created, createResponse.StatusCode);
            var created = await DeserializeResponseAsync<CashflowDto>(createResponse);

            // Act
            var response = await Client.GetAsync($"{BaseUrl(seed.ProjectId)}/{created.Id}");

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }

        #endregion

        #region UpdateCashflow

        [Fact]
        public async Task UpdateCashflow_ShouldReturn200_WhenExists()
        {
            // Arrange
            var seed = await SeedProjectOnlyAsync();
            var createDto = new CashflowDto
            {
                ProjectId = seed.ProjectId,
                Month = "March",
                TotalProjectCost = 9000m
            };
            var createResponse = await Client.PostAsJsonAsync(BaseUrl(seed.ProjectId), createDto);
            var created = await DeserializeResponseAsync<CashflowDto>(createResponse);

            var updateDto = new CashflowDto
            {
                Id = created.Id,
                ProjectId = seed.ProjectId,
                Month = "March",
                TotalProjectCost = 10000m
            };

            // Act
            var response = await Client.PutAsJsonAsync($"{BaseUrl(seed.ProjectId)}/{created.Id}", updateDto);

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }

        [Fact]
        public async Task UpdateCashflow_ShouldReturn400_WhenIdMismatch()
        {
            // Arrange
            var seed = await SeedProjectOnlyAsync();
            var updateDto = new CashflowDto { Id = 999, ProjectId = seed.ProjectId, Month = "April" };

            // Act
            var response = await Client.PutAsJsonAsync($"{BaseUrl(seed.ProjectId)}/1", updateDto);

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }

        #endregion

        #region DeleteCashflow

        [Fact]
        public async Task DeleteCashflow_ShouldReturn204_WhenExists()
        {
            // Arrange
            var seed = await SeedProjectOnlyAsync();
            var createDto = new CashflowDto
            {
                ProjectId = seed.ProjectId,
                Month = "May",
                TotalProjectCost = 5000m
            };
            var createResponse = await Client.PostAsJsonAsync(BaseUrl(seed.ProjectId), createDto);
            var created = await DeserializeResponseAsync<CashflowDto>(createResponse);

            // Act
            var response = await Client.DeleteAsync($"{BaseUrl(seed.ProjectId)}/{created.Id}");

            // Assert
            Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);

            // Verify deleted
            var getResponse = await Client.GetAsync($"{BaseUrl(seed.ProjectId)}/{created.Id}");
            Assert.Equal(HttpStatusCode.NotFound, getResponse.StatusCode);
        }

        #endregion
    }
}

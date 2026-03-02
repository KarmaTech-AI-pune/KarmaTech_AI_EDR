using System.Net;
using System.Net.Http.Json;
using EDR.API.Tests.Infrastructure;
using EDR.Application.DTOs;

namespace EDR.API.Tests.Integration
{
    /// <summary>
    /// Integration tests for MonthlyProgressController.
    /// Uses WebApplicationFactory with InMemory database — no mocking.
    /// </summary>
    public class MonthlyProgressControllerIntegrationTests : IntegrationTestBase
    {
        private string BaseUrl(int projectId) => $"/api/projects/{projectId}/monthlyprogress";
        private string YearMonthUrl(int projectId, int year, int month) => $"{BaseUrl(projectId)}/year/{year}/month/{month}";

        private CreateMonthlyProgressDto BuildCreateDto(int month = 3, int year = 2024) => new()
        {
            Month = month,
            Year = year,
            FinancialAndContractDetails = null,
            ActualCost = null,
            CtcAndEac = null,
            Schedule = null,
            BudgetTable = null,
            ManpowerPlanning = null
        };

        #region GetAllMonthlyProgressByProject

        [Fact]
        public async Task GetAllMonthlyProgressByProject_ShouldReturn200_ForValidProject()
        {
            // Arrange
            var seed = await SeedProjectOnlyAsync();

            // Act
            var response = await Client.GetAsync(BaseUrl(seed.ProjectId));

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }

        #endregion

        #region CreateMonthlyProgress

        [Fact]
        public async Task CreateMonthlyProgress_ShouldReturn201_WhenValid()
        {
            // Arrange
            var seed = await SeedProjectOnlyAsync();
            var dto = BuildCreateDto(1, 2024);

            // Act
            var response = await Client.PostAsJsonAsync(BaseUrl(seed.ProjectId), dto);

            // Assert
            Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        }

        [Fact]
        public async Task CreateMonthlyProgress_ShouldReturn400_WhenBodyIsNull()
        {
            // Arrange
            var seed = await SeedProjectOnlyAsync();

            // Act
            var response = await Client.PostAsJsonAsync<CreateMonthlyProgressDto>(BaseUrl(seed.ProjectId), null);

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }

        #endregion

        #region GetMonthlyProgressByYearMonth

        [Fact]
        public async Task GetMonthlyProgressByYearMonth_ShouldReturn404_WhenNotExists()
        {
            // Arrange
            var seed = await SeedProjectOnlyAsync();

            // Act
            var response = await Client.GetAsync(YearMonthUrl(seed.ProjectId, 2024, 12));

            // Assert
            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        }

        [Fact]
        public async Task GetMonthlyProgressByYearMonth_ShouldReturn200_AfterCreate()
        {
            // Arrange
            var seed = await SeedProjectOnlyAsync();
            var createResponse = await Client.PostAsJsonAsync(BaseUrl(seed.ProjectId), BuildCreateDto(6, 2024));
            Assert.Equal(HttpStatusCode.Created, createResponse.StatusCode);

            // Act
            var response = await Client.GetAsync(YearMonthUrl(seed.ProjectId, 2024, 6));

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }

        #endregion

        #region UpdateMonthlyProgressByYearMonth

        [Fact]
        public async Task UpdateMonthlyProgressByYearMonth_ShouldReturn204_WhenExists()
        {
            // Arrange
            var seed = await SeedProjectOnlyAsync();
            await Client.PostAsJsonAsync(BaseUrl(seed.ProjectId), BuildCreateDto(7, 2024));

            var updateDto = BuildCreateDto(7, 2024);

            // Act
            var response = await Client.PutAsJsonAsync(YearMonthUrl(seed.ProjectId, 2024, 7), updateDto);

            // Assert
            Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        }

        [Fact]
        public async Task UpdateMonthlyProgressByYearMonth_ShouldReturn404_WhenNotExists()
        {
            // Arrange
            var seed = await SeedProjectOnlyAsync();

            // Act
            var response = await Client.PutAsJsonAsync(YearMonthUrl(seed.ProjectId, 2024, 11), BuildCreateDto(11, 2024));

            // Assert
            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        }

        [Fact]
        public async Task UpdateMonthlyProgressByYearMonth_ShouldReturn400_WhenBodyIsNull()
        {
            // Arrange
            var seed = await SeedProjectOnlyAsync();

            // Act
            var response = await Client.PutAsJsonAsync<CreateMonthlyProgressDto>(YearMonthUrl(seed.ProjectId, 2024, 8), null);

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }

        #endregion

        #region DeleteMonthlyProgressByYearMonth

        [Fact]
        public async Task DeleteMonthlyProgressByYearMonth_ShouldReturn204_WhenExists()
        {
            // Arrange
            var seed = await SeedProjectOnlyAsync();
            await Client.PostAsJsonAsync(BaseUrl(seed.ProjectId), BuildCreateDto(9, 2024));

            // Act
            var response = await Client.DeleteAsync(YearMonthUrl(seed.ProjectId, 2024, 9));

            // Assert
            Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);

            // Verify deleted
            var getResponse = await Client.GetAsync(YearMonthUrl(seed.ProjectId, 2024, 9));
            Assert.Equal(HttpStatusCode.NotFound, getResponse.StatusCode);
        }

        [Fact]
        public async Task DeleteMonthlyProgressByYearMonth_ShouldReturn404_WhenNotExists()
        {
            // Arrange
            var seed = await SeedProjectOnlyAsync();

            // Act
            var response = await Client.DeleteAsync(YearMonthUrl(seed.ProjectId, 2024, 10));

            // Assert
            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        }

        #endregion
    }
}

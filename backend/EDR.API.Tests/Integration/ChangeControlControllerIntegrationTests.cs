using System.Net;
using System.Net.Http.Json;
using EDR.API.Tests.Infrastructure;
using EDR.Application.Dtos;

namespace EDR.API.Tests.Integration
{
    /// <summary>
    /// Integration tests for ChangeControlController.
    /// Uses WebApplicationFactory with InMemory database — no mocking.
    /// </summary>
    public class ChangeControlControllerIntegrationTests : IntegrationTestBase
    {
        private string BaseUrl(int projectId) => $"/api/projects/{projectId}/changecontrols";

        private ChangeControlDto BuildCreateDto(int projectId) => new()
        {
            ProjectId = projectId,
            SrNo = 1,
            DateLogged = DateTime.UtcNow,
            Originator = "Integration Test",
            Description = "Change control created via integration test",
            CostImpact = "Low",
            TimeImpact = "Low",
            ResourcesImpact = "Low",
            QualityImpact = "Low",
            ChangeOrderStatus = "Pending",
            ClientApprovalStatus = "Pending",
            ClaimSituation = "None"
        };

        #region GetChangeControlsByProjectId

        [Fact]
        public async Task GetChangeControlsByProjectId_ShouldReturn200_ForAnyProject()
        {
            // Arrange
            var seed = await SeedProjectOnlyAsync();

            // Act
            var response = await Client.GetAsync(BaseUrl(seed.ProjectId));

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }

        #endregion

        #region CreateChangeControl

        [Fact]
        public async Task CreateChangeControl_ShouldReturn201_WhenValid()
        {
            // Arrange
            var seed = await SeedProjectOnlyAsync();
            var dto = BuildCreateDto(seed.ProjectId);

            // Act
            var response = await Client.PostAsJsonAsync(BaseUrl(seed.ProjectId), dto);

            // Assert
            Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        }

        [Fact]
        public async Task CreateChangeControl_ShouldReturn400_WhenBodyIsNull()
        {
            // Arrange
            var seed = await SeedProjectOnlyAsync();

            // Act
            var response = await Client.PostAsJsonAsync<ChangeControlDto>(BaseUrl(seed.ProjectId), null);

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }

        #endregion

        #region GetChangeControlById

        [Fact]
        public async Task GetChangeControlById_ShouldReturn404_WhenNotExists()
        {
            // Arrange
            var seed = await SeedProjectOnlyAsync();

            // Act
            var response = await Client.GetAsync($"{BaseUrl(seed.ProjectId)}/99999");

            // Assert
            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        }

        [Fact]
        public async Task GetChangeControlById_ShouldReturn200_AfterCreate()
        {
            // Arrange
            var seed = await SeedProjectOnlyAsync();
            var createResponse = await Client.PostAsJsonAsync(BaseUrl(seed.ProjectId), BuildCreateDto(seed.ProjectId));
            Assert.Equal(HttpStatusCode.Created, createResponse.StatusCode);
            var created = await DeserializeResponseAsync<ChangeControlDto>(createResponse);

            // Act
            var response = await Client.GetAsync($"{BaseUrl(seed.ProjectId)}/{created.Id}");

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }

        #endregion

        #region UpdateChangeControl

        [Fact]
        public async Task UpdateChangeControl_ShouldReturn200_WhenExists()
        {
            // Arrange
            var seed = await SeedProjectOnlyAsync();
            var createResponse = await Client.PostAsJsonAsync(BaseUrl(seed.ProjectId), BuildCreateDto(seed.ProjectId));
            var created = await DeserializeResponseAsync<ChangeControlDto>(createResponse);

            var updateDto = new ChangeControlDto
            {
                Id = created.Id,
                ProjectId = seed.ProjectId,
                SrNo = 1,
                DateLogged = DateTime.UtcNow,
                Originator = "Updated Originator",
                Description = "Updated description",
                CostImpact = "High",
                TimeImpact = "Medium",
                ResourcesImpact = "Low",
                QualityImpact = "Low",
                ChangeOrderStatus = "Approved",
                ClientApprovalStatus = "Approved",
                ClaimSituation = "None"
            };

            // Act
            var response = await Client.PutAsJsonAsync($"{BaseUrl(seed.ProjectId)}/{created.Id}", updateDto);

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }

        [Fact]
        public async Task UpdateChangeControl_ShouldReturn400_WhenIdMismatch()
        {
            // Arrange
            var seed = await SeedProjectOnlyAsync();
            var dto = BuildCreateDto(seed.ProjectId);
            dto.Id = 999;

            // Act
            var response = await Client.PutAsJsonAsync($"{BaseUrl(seed.ProjectId)}/1", dto);

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }

        #endregion

        #region DeleteChangeControl

        [Fact]
        public async Task DeleteChangeControl_ShouldReturn204_WhenExists()
        {
            // Arrange
            var seed = await SeedProjectOnlyAsync();
            var createResponse = await Client.PostAsJsonAsync(BaseUrl(seed.ProjectId), BuildCreateDto(seed.ProjectId));
            var created = await DeserializeResponseAsync<ChangeControlDto>(createResponse);

            // Act
            var response = await Client.DeleteAsync($"{BaseUrl(seed.ProjectId)}/{created.Id}");

            // Assert
            Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);

            // Verify deleted
            var getResponse = await Client.GetAsync($"{BaseUrl(seed.ProjectId)}/{created.Id}");
            Assert.Equal(HttpStatusCode.NotFound, getResponse.StatusCode);
        }

        [Fact]
        public async Task DeleteChangeControl_ShouldReturn404_WhenNotExists()
        {
            // Arrange
            var seed = await SeedProjectOnlyAsync();

            // Act
            var response = await Client.DeleteAsync($"{BaseUrl(seed.ProjectId)}/99999");

            // Assert
            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        }

        #endregion
    }
}

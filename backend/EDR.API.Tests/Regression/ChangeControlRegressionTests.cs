using System.Net;
using System.Net.Http.Json;
using EDR.API.Tests.Infrastructure;
using EDR.Application.Dtos;
using Xunit;

namespace EDR.API.Tests.Regression
{
    /// <summary>
    /// Regression tests for Change Control workflows.
    /// Verifies create, update, list, and delete operations for change controls,
    /// and ensures changes are properly scoped to projects.
    /// </summary>
    public class ChangeControlRegressionTests : IntegrationTestBase
    {
        [Fact]
        public async Task ChangeControl_CreateAndRetrieve_DataIntegrity()
        {
            // Arrange
            var seed = await SeedProjectOnlyAsync();

            var changeControlDto = new ChangeControlDto
            {
                ProjectId = seed.ProjectId,
                SrNo = 1,
                DateLogged = DateTime.UtcNow,
                Originator = "Regression Tester",
                Description = "Regression test change control",
                CostImpact = "Medium",
                TimeImpact = "Low",
                ResourcesImpact = "None",
                QualityImpact = "None",
                ChangeOrderStatus = "Pending",
                ClientApprovalStatus = "Pending",
                ClaimSituation = "N/A"
            };

            // Act: create
            var createResponse = await Client.PostAsJsonAsync(
                $"/api/projects/{seed.ProjectId}/changecontrols", changeControlDto);
            Assert.Equal(HttpStatusCode.Created, createResponse.StatusCode);
            var created = await DeserializeResponseAsync<ChangeControlDto>(createResponse);

            // Assert: retrieve by ID
            var getResponse = await Client.GetAsync(
                $"/api/projects/{seed.ProjectId}/changecontrols/{created.Id}");
            Assert.Equal(HttpStatusCode.OK, getResponse.StatusCode);
            var fetched = await DeserializeResponseAsync<ChangeControlDto>(getResponse);
            Assert.Equal("Regression test change control", fetched.Description);
            Assert.Equal("Pending", fetched.ChangeOrderStatus);
        }

        [Fact]
        public async Task ChangeControl_UpdateThenVerify()
        {
            // Arrange
            var seed = await SeedProjectOnlyAsync();

            var dto = new ChangeControlDto
            {
                ProjectId = seed.ProjectId,
                SrNo = 2,
                DateLogged = DateTime.UtcNow,
                Originator = "Original Author",
                Description = "Original description",
                CostImpact = "Low",
                TimeImpact = "Low",
                ResourcesImpact = "None",
                QualityImpact = "None",
                ChangeOrderStatus = "Open",
                ClientApprovalStatus = "Pending",
                ClaimSituation = "N/A"
            };

            var createResponse = await Client.PostAsJsonAsync(
                $"/api/projects/{seed.ProjectId}/changecontrols", dto);
            Assert.Equal(HttpStatusCode.Created, createResponse.StatusCode);
            var created = await DeserializeResponseAsync<ChangeControlDto>(createResponse);

            // Act: update
            created.Description = "Updated regression description";
            created.ChangeOrderStatus = "Approved";
            var updateResponse = await Client.PutAsJsonAsync(
                $"/api/projects/{seed.ProjectId}/changecontrols/{created.Id}", created);
            Assert.True(updateResponse.IsSuccessStatusCode);

            // Assert: verify update persisted
            var getResponse = await Client.GetAsync(
                $"/api/projects/{seed.ProjectId}/changecontrols/{created.Id}");
            Assert.Equal(HttpStatusCode.OK, getResponse.StatusCode);
            var fetched = await DeserializeResponseAsync<ChangeControlDto>(getResponse);
            Assert.Equal("Updated regression description", fetched.Description);
            Assert.Equal("Approved", fetched.ChangeOrderStatus);
        }

        [Fact]
        public async Task ChangeControl_MultipleForSameProject_AllRetrievable()
        {
            // Arrange
            var seed = await SeedProjectOnlyAsync();

            for (int i = 1; i <= 3; i++)
            {
                var dto = new ChangeControlDto
                {
                    ProjectId = seed.ProjectId,
                    SrNo = i,
                    DateLogged = DateTime.UtcNow.AddDays(-i),
                    Originator = $"Tester {i}",
                    Description = $"Change control #{i}",
                    CostImpact = "Low",
                    TimeImpact = "Low",
                    ResourcesImpact = "None",
                    QualityImpact = "None",
                    ChangeOrderStatus = "Open",
                    ClientApprovalStatus = "Pending",
                    ClaimSituation = "N/A"
                };
                var response = await Client.PostAsJsonAsync(
                    $"/api/projects/{seed.ProjectId}/changecontrols", dto);
                Assert.Equal(HttpStatusCode.Created, response.StatusCode);
            }

            // Act: list all for project
            var listResponse = await Client.GetAsync(
                $"/api/projects/{seed.ProjectId}/changecontrols");
            Assert.Equal(HttpStatusCode.OK, listResponse.StatusCode);

            var content = await listResponse.Content.ReadAsStringAsync();
            Assert.Contains("Change control #1", content);
            Assert.Contains("Change control #2", content);
            Assert.Contains("Change control #3", content);
        }

        [Fact]
        public async Task ChangeControl_DeleteThenGet_ReturnsNotFound()
        {
            // Arrange
            var seed = await SeedProjectOnlyAsync();

            var dto = new ChangeControlDto
            {
                ProjectId = seed.ProjectId,
                SrNo = 10,
                DateLogged = DateTime.UtcNow,
                Originator = "Delete Tester",
                Description = "Will be deleted",
                CostImpact = "None",
                TimeImpact = "None",
                ResourcesImpact = "None",
                QualityImpact = "None",
                ChangeOrderStatus = "Open",
                ClientApprovalStatus = "N/A",
                ClaimSituation = "N/A"
            };

            var createResponse = await Client.PostAsJsonAsync(
                $"/api/projects/{seed.ProjectId}/changecontrols", dto);
            Assert.Equal(HttpStatusCode.Created, createResponse.StatusCode);
            var created = await DeserializeResponseAsync<ChangeControlDto>(createResponse);

            // Act: delete
            var deleteResponse = await Client.DeleteAsync(
                $"/api/projects/{seed.ProjectId}/changecontrols/{created.Id}");
            Assert.True(deleteResponse.IsSuccessStatusCode);

            // Assert: no longer fetchable
            var getResponse = await Client.GetAsync(
                $"/api/projects/{seed.ProjectId}/changecontrols/{created.Id}");
            Assert.Equal(HttpStatusCode.NotFound, getResponse.StatusCode);
        }
    }
}

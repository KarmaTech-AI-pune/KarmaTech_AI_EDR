using System;
using System.Net;
using System.Net.Http.Json;
using System.Threading.Tasks;
using EDR.API.Tests.Infrastructure;
using EDR.Application.Dtos;
using Xunit;

namespace EDR.API.Tests.Integration
{
    public class JobStartFormControllerIntegrationTests : IntegrationTestBase
    {
        private const string BaseUrlTemplate = "/api/projects/{0}/jobstartforms";
        private string BaseUrl(int projectId) => string.Format(BaseUrlTemplate, projectId);

        #region GetAllJobStartForms

        [Fact]
        public async Task GetAllJobStartForms_ShouldReturn200_ForValidProject()
        {
            // Arrange
            var seed = await SeedProjectOnlyAsync();

            // Act
            var response = await Client.GetAsync(BaseUrl(seed.ProjectId));

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }

        #endregion

        #region CreateJobStartForm

        [Fact]
        public async Task CreateJobStartForm_ShouldReturn201_WhenValid()
        {
            // Arrange
            var seed = await SeedProjectOnlyAsync();
            var dto = new JobStartFormDto
            {
                ProjectId = seed.ProjectId,
                FormTitle = "New Job Start Form",
                Description = "Integration Test Description",
                StartDate = DateTime.UtcNow,
                PreparedBy = "Test User"
            };

            // Act
            var response = await Client.PostAsJsonAsync(BaseUrl(seed.ProjectId), dto);

            // Assert
            Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        }

        [Fact]
        public async Task CreateJobStartForm_ShouldReturn400_WhenBodyIsNull()
        {
            // Arrange
            var seed = await SeedProjectOnlyAsync();

            // Act
            var response = await Client.PostAsJsonAsync<JobStartFormDto>(BaseUrl(seed.ProjectId), null);

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }

        #endregion

        #region GetJobStartFormById

        [Fact]
        public async Task GetJobStartFormById_ShouldReturn404_WhenNotExists()
        {
            // Arrange
            var seed = await SeedProjectOnlyAsync();

            // Act
            var response = await Client.GetAsync($"{BaseUrl(seed.ProjectId)}/99999");

            // Assert
            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        }

        [Fact]
        public async Task GetJobStartFormById_ShouldReturn200_AfterCreate()
        {
            // Arrange
            var seed = await SeedProjectOnlyAsync();
            var createDto = new JobStartFormDto
            {
                ProjectId = seed.ProjectId,
                FormTitle = "To Read",
                Description = "Exists"
            };
            var createResponse = await Client.PostAsJsonAsync(BaseUrl(seed.ProjectId), createDto);
            Assert.Equal(HttpStatusCode.Created, createResponse.StatusCode);
            var created = await DeserializeResponseAsync<JobStartFormDto>(createResponse);

            // Act
            var response = await Client.GetAsync($"{BaseUrl(seed.ProjectId)}/{created.FormId}");

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }

        #endregion

        #region UpdateJobStartForm

        [Fact]
        public async Task UpdateJobStartForm_ShouldReturn204_WhenExists()
        {
            // Arrange
            var seed = await SeedProjectOnlyAsync();
            var createDto = new JobStartFormDto
            {
                ProjectId = seed.ProjectId,
                FormTitle = "To Update"
            };
            var createResponse = await Client.PostAsJsonAsync(BaseUrl(seed.ProjectId), createDto);
            var created = await DeserializeResponseAsync<JobStartFormDto>(createResponse);

            var updateDto = new JobStartFormDto
            {
                FormId = created.FormId,
                ProjectId = seed.ProjectId,
                FormTitle = "Updated Title"
            };

            // Act
            var response = await Client.PutAsJsonAsync($"{BaseUrl(seed.ProjectId)}/{created.FormId}", updateDto);

            // Assert
            Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        }

        [Fact]
        public async Task UpdateJobStartForm_ShouldReturn400_WhenIdMismatch()
        {
            // Arrange
            var seed = await SeedProjectOnlyAsync();
            var updateDto = new JobStartFormDto { FormId = 999, ProjectId = seed.ProjectId, FormTitle = "Bad Update" };

            // Act
            var response = await Client.PutAsJsonAsync($"{BaseUrl(seed.ProjectId)}/1", updateDto);

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }

        #endregion

        #region DeleteJobStartForm

        [Fact]
        public async Task DeleteJobStartForm_ShouldReturn204_WhenExists()
        {
            // Arrange
            var seed = await SeedProjectOnlyAsync();
            var createDto = new JobStartFormDto
            {
                ProjectId = seed.ProjectId,
                FormTitle = "To Delete"
            };
            var createResponse = await Client.PostAsJsonAsync(BaseUrl(seed.ProjectId), createDto);
            var created = await DeserializeResponseAsync<JobStartFormDto>(createResponse);

            // Act
            var response = await Client.DeleteAsync($"{BaseUrl(seed.ProjectId)}/{created.FormId}");

            // Assert
            Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);

            // Verify deleted
            var getResponse = await Client.GetAsync($"{BaseUrl(seed.ProjectId)}/{created.FormId}");
            Assert.Equal(HttpStatusCode.NotFound, getResponse.StatusCode);
        }

        #endregion
    }
}

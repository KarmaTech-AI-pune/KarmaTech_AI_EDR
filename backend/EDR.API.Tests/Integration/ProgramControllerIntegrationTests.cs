using System.Net;
using System.Net.Http.Json;
using System.Threading.Tasks;
using System.Collections.Generic;
using EDR.API.Tests.Infrastructure;
using EDR.Application.DTOs;
using Xunit;

namespace EDR.API.Tests.Integration
{
    public class ProgramControllerIntegrationTests : IntegrationTestBase
    {
        private const string BaseUrl = "/api/Program";

        [Fact]
        public async Task GetAll_ShouldReturn200()
        {
            // Arrange
            await SeedDatabaseAsync();

            // Act
            var response = await Client.GetAsync(BaseUrl);

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            var content = await DeserializeResponseAsync<List<ProgramDto>>(response);
            Assert.NotEmpty(content);
        }

        [Fact]
        public async Task GetById_ShouldReturn200_ForSeededProgram()
        {
            // Arrange
            var seed = await SeedDatabaseAsync();

            // Act
            var response = await Client.GetAsync($"{BaseUrl}/{seed.ProgramId}");

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            var content = await DeserializeResponseAsync<ProgramDto>(response);
            Assert.Equal(seed.ProgramId, content.Id);
        }

        [Fact]
        public async Task GetById_ShouldReturn404_ForInvalidId()
        {
            // Act
            var response = await Client.GetAsync($"{BaseUrl}/999");

            // Assert
            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        }

        [Fact]
        public async Task Create_ShouldReturn201()
        {
            // Arrange
            var dto = new ProgramDto
            {
                Name = "New Integration Program",
                Description = "A new program for test",
                TenantId = 1
            };

            // Act
            var response = await Client.PostAsJsonAsync(BaseUrl, dto);

            // Assert
            Assert.Equal(HttpStatusCode.Created, response.StatusCode);
            var location = response.Headers.Location;
            Assert.NotNull(location);
        }

        [Fact]
        public async Task Update_ShouldReturn200_WhenValid()
        {
            // Arrange
            var seed = await SeedDatabaseAsync();
            var updateDto = new ProgramDto
            {
                Id = seed.ProgramId,
                Name = "Updated Integration Program",
                Description = "Updated Desc",
                TenantId = 1
            };

            // Act
            var response = await Client.PutAsJsonAsync($"{BaseUrl}/{seed.ProgramId}", updateDto);

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            var content = await DeserializeResponseAsync<ProgramDto>(response);
            Assert.Equal("Updated Integration Program", content.Name);
        }

        [Fact]
        public async Task Update_ShouldReturn400_WhenIdMismatch()
        {
            // Arrange
            var updateDto = new ProgramDto { Id = 99 };

            // Act
            var response = await Client.PutAsJsonAsync($"{BaseUrl}/1", updateDto);

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }

        [Fact]
        public async Task Delete_ShouldReturn200_WhenValid()
        {
            // Arrange
            var seed = await SeedDatabaseAsync();

            // Act
            var response = await Client.DeleteAsync($"{BaseUrl}/{seed.ProgramId}");

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }
    }
}

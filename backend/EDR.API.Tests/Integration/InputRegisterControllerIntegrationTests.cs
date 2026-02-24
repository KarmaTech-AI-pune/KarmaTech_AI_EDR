using System;
using System.Net;
using System.Net.Http.Json;
using System.Threading.Tasks;
using EDR.API.Tests.Infrastructure;
using EDR.Application.CQRS.InputRegister.Commands;
using EDR.Application.DTOs;
using Xunit;

namespace EDR.API.Tests.Integration
{
    public class InputRegisterControllerIntegrationTests : IntegrationTestBase
    {
        private const string BaseUrl = "/api/InputRegister";

        #region GetAll

        [Fact]
        public async Task GetAll_ShouldReturn200()
        {
            // Act
            var response = await Client.GetAsync(BaseUrl);

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }

        #endregion

        #region Create

        [Fact]
        public async Task Create_ShouldReturn201_WhenValid()
        {
            // Arrange
            var seed = await SeedProjectOnlyAsync();
            var dto = new CreateInputRegisterCommand
            {
                ProjectId = seed.ProjectId,
                DataReceived = "Integration Test Data",
                ReceiptDate = DateTime.UtcNow,
                ReceivedFrom = "Test Source",
                FilesFormat = "PDF",
                NoOfFiles = 2,
                FitForPurpose = true,
                Check = true,
                CheckedBy = "Tester",
                Custodian = "Custodian",
                StoragePath = "/test/path",
                Remarks = "Test remarks",
                CreatedBy = "System"
            };

            // Act
            var response = await Client.PostAsJsonAsync(BaseUrl, dto);

            // Assert
            Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        }

        [Fact]
        public async Task Create_ShouldReturn400_WhenBodyIsNull()
        {
            // Act
            var response = await Client.PostAsJsonAsync<CreateInputRegisterCommand>(BaseUrl, null);

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }

        #endregion

        #region GetById

        [Fact]
        public async Task GetById_ShouldReturn404_WhenNotExists()
        {
            // Act
            var response = await Client.GetAsync($"{BaseUrl}/99999");

            // Assert
            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        }

        [Fact]
        public async Task GetById_ShouldReturn200_AfterCreate()
        {
            // Arrange
            var seed = await SeedProjectOnlyAsync();
            var command = new CreateInputRegisterCommand
            {
                ProjectId = seed.ProjectId,
                DataReceived = "Test Data to GET",
                ReceiptDate = DateTime.UtcNow,
                ReceivedFrom = "Test",
                FilesFormat = "CSV",
                NoOfFiles = 1,
                FitForPurpose = true,
                Check = true,
                CheckedBy = "Tester",
                Custodian = "Custodian",
                StoragePath = "/test/path",
                Remarks = "Test remarks",
                CreatedBy = "System"
            };
            var createResponse = await Client.PostAsJsonAsync(BaseUrl, command);
            var errorContent = await createResponse.Content.ReadAsStringAsync();
            Assert.True(createResponse.IsSuccessStatusCode, $"Create failed with {createResponse.StatusCode}: {errorContent}");
            var created = await DeserializeResponseAsync<InputRegisterDto>(createResponse);

            // Act
            var response = await Client.GetAsync($"{BaseUrl}/{created.Id}");

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }

        #endregion

        #region GetByProject

        [Fact]
        public async Task GetByProject_ShouldReturn200()
        {
            // Arrange
            var seed = await SeedProjectOnlyAsync();

            // Act
            var response = await Client.GetAsync($"{BaseUrl}/project/{seed.ProjectId}");

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }

        #endregion

        #region Update

        [Fact]
        public async Task Update_ShouldReturn200_WhenExists()
        {
            // Arrange
            var seed = await SeedProjectOnlyAsync();
            var createCmd = new CreateInputRegisterCommand
            {
                ProjectId = seed.ProjectId,
                DataReceived = "Create for Update",
                ReceiptDate = DateTime.UtcNow,
                ReceivedFrom = "Test",
                FilesFormat = "CSV",
                NoOfFiles = 1,
                FitForPurpose = true,
                Check = true,
                CheckedBy = "Tester",
                Custodian = "Custodian",
                StoragePath = "/test/path",
                Remarks = "Test remarks",
                CreatedBy = "System"
            };
            var createResponse = await Client.PostAsJsonAsync(BaseUrl, createCmd);
            var errorContent = await createResponse.Content.ReadAsStringAsync();
            Assert.True(createResponse.IsSuccessStatusCode, $"Create failed with {createResponse.StatusCode}: {errorContent}");
            var created = await DeserializeResponseAsync<InputRegisterDto>(createResponse);

            var updateCmd = new UpdateInputRegisterCommand
            {
                Id = created.Id,
                ProjectId = seed.ProjectId,
                DataReceived = "Updated Data",
                ReceiptDate = DateTime.UtcNow,
                ReceivedFrom = "Test",
                FilesFormat = "CSV",
                NoOfFiles = 1,
                FitForPurpose = true,
                Check = true,
                CheckedBy = "Tester",
                Custodian = "Custodian",
                StoragePath = "/test/path",
                Remarks = "Test remarks",
                UpdatedBy = "System"
            };

            // Act
            var response = await Client.PutAsJsonAsync($"{BaseUrl}/{created.Id}", updateCmd);

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            var updated = await DeserializeResponseAsync<InputRegisterDto>(response);
            Assert.Equal("Updated Data", updated.DataReceived);
        }

        [Fact]
        public async Task Update_ShouldReturn400_WhenIdMismatch()
        {
            // Arrange
            var updateCmd = new UpdateInputRegisterCommand { Id = 999 };

            // Act
            var response = await Client.PutAsJsonAsync($"{BaseUrl}/1", updateCmd);

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }

        #endregion

        #region Delete

        [Fact]
        public async Task Delete_ShouldReturn204_WhenExists()
        {
            // Arrange
            var seed = await SeedProjectOnlyAsync();
            var createCmd = new CreateInputRegisterCommand 
            { 
                ProjectId = seed.ProjectId, 
                DataReceived = "To Delete",
                ReceiptDate = DateTime.UtcNow,
                ReceivedFrom = "Test",
                FilesFormat = "CSV",
                NoOfFiles = 1,
                FitForPurpose = true,
                Check = true,
                CheckedBy = "Tester",
                Custodian = "Custodian",
                StoragePath = "/test/path",
                Remarks = "Test remarks",
                CreatedBy = "System"
            };
            var createResponse = await Client.PostAsJsonAsync(BaseUrl, createCmd);
            var errorContent = await createResponse.Content.ReadAsStringAsync();
            Assert.True(createResponse.IsSuccessStatusCode, $"Create failed with {createResponse.StatusCode}: {errorContent}");
            var created = await DeserializeResponseAsync<InputRegisterDto>(createResponse);

            // Act
            var response = await Client.DeleteAsync($"{BaseUrl}/{created.Id}");

            // Assert
            Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);

            // Verify deleted
            var getResponse = await Client.GetAsync($"{BaseUrl}/{created.Id}");
            Assert.Equal(HttpStatusCode.NotFound, getResponse.StatusCode);
        }

        #endregion
    }
}

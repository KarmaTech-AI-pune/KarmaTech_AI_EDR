using System.Net;
using System.Threading.Tasks;
using EDR.API.Tests.Infrastructure;
using Xunit;

namespace EDR.API.Tests.Integration
{
    public class ExcelControllerIntegrationTests : IntegrationTestBase
    {
        private const string BaseUrl = "/api/Excel";

        [Fact]
        public async Task ExportOptionsToExcel_ShouldReturn200AndExcelFile()
        {
            // Arrange - seeding a project populates the context with some initial options
            await SeedProjectOnlyAsync();

            // Act
            var response = await Client.GetAsync($"{BaseUrl}/export-options");

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            Assert.Equal("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", response.Content.Headers.ContentType?.MediaType);
            
            var content = await response.Content.ReadAsByteArrayAsync();
            Assert.NotEmpty(content);
        }
    }
}

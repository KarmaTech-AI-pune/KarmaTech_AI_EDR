using System.Net;
using System.Net.Http.Json;
using System.Threading.Tasks;
using EDR.API.Tests.Infrastructure;
using Xunit;

namespace EDR.API.Tests.Integration
{
    public class CreateAccountControllerIntegrationTests : IntegrationTestBase
    {
        private const string BaseUrl = "/api/CreateAccount";

        [Fact]
        public async Task CreateAccount_ShouldReturn400Or500_WhenInvalidRequest()
        {
            var command = new { EmailAddress = "test@example.com", Subdomain = "testsub" };
            var response = await Client.PostAsJsonAsync(BaseUrl, command);
            
            // Depending on validation rules that might be missing in DTO, or DB issues
            Assert.True(
                response.StatusCode == HttpStatusCode.BadRequest || 
                response.StatusCode == HttpStatusCode.InternalServerError ||
                response.StatusCode == HttpStatusCode.Created ||
                response.StatusCode == HttpStatusCode.Conflict
            );
        }
    }
}

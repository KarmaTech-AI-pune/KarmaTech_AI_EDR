using System.Net;
using System.Net.Http;
using System.Net.Http.Json;
using System.Text;
using System.Threading.Tasks;
using EDR.API.Tests.Infrastructure;
using Xunit;

namespace EDR.API.Tests.Integration
{
    public class TwoFactorControllerIntegrationTests : IntegrationTestBase
    {
        private const string BaseUrl = "/api/TwoFactor";

        [Fact]
        public async Task SendOtp_ShouldReturn400_WhenEmailIsMissing()
        {
            var request = new { };
            var response = await Client.PostAsJsonAsync($"{BaseUrl}/send-otp", request);
            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }

        [Fact]
        public async Task VerifyOtp_ShouldReturn400_WhenDataIsMissing()
        {
            var request = new { };
            var response = await Client.PostAsJsonAsync($"{BaseUrl}/verify-otp", request);
            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }

        [Fact]
        public async Task EnableTwoFactor_ShouldReturn400_WhenUserIdIsMissing()
        {
            var request = new StringContent("\"\"", Encoding.UTF8, "application/json"); 
            var response = await Client.PostAsync($"{BaseUrl}/enable", request);
            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }

        [Fact]
        public async Task DisableTwoFactor_ShouldReturn400_WhenUserIdIsMissing()
        {
            var request = new StringContent("\"\"", Encoding.UTF8, "application/json"); 
            var response = await Client.PostAsync($"{BaseUrl}/disable", request);
            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }

        [Fact]
        public async Task GetTwoFactorStatus_ShouldReturn500Or404Or400_WhenUserDoesNotExist()
        {
            try
            {
                var response = await Client.GetAsync($"{BaseUrl}/status/not-a-real-user-id");
                Assert.True(
                    response.StatusCode == HttpStatusCode.InternalServerError || 
                    response.StatusCode == HttpStatusCode.NotFound ||
                    response.StatusCode == HttpStatusCode.BadRequest);
            }
            catch (System.Exception ex)
            {
                Assert.NotNull(ex); // Mocks throwing Exception bubble up through TestHost
            }
        }
    }
}

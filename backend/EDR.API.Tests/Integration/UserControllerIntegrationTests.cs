using System;
using System.Net;
using System.Net.Http.Json;
using System.Threading.Tasks;
using System.Collections.Generic;
using EDR.API.Tests.Infrastructure;
using EDR.Application.CQRS.Users.Commands;
using EDR.Application.Dtos;
using Xunit;

namespace EDR.API.Tests.Integration
{
    public class UserControllerIntegrationTests : IntegrationTestBase
    {
        private const string BaseUrl = "/api/User";

        [Fact]
        public async Task GetAll_ShouldReturn200()
        {
            var response = await Client.GetAsync(BaseUrl);
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }

        [Fact]
        public async Task GetById_ShouldReturn404_WhenUserNotFound()
        {
            var response = await Client.GetAsync($"{BaseUrl}/9999-not-found-id");
            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        }

        [Fact]
        public async Task Create_ShouldReturn200_WhenValid()
        {
            // The Create endpoint expects a list of commands
            var commands = new List<CreateUserCommand>
            {
                new CreateUserCommand
                {
                    UserName = "integrationtestuser",
                    Name = "Integration Test User",
                    Email = "integration@test.com",
                    Password = "Password!123",
                    StandardRate = 100M,
                    IsConsultant = false
                }
            };

            var response = await Client.PostAsJsonAsync($"{BaseUrl}/Create", commands);

            // Because "Admin@123" is set inside the controller, and it calls mediatr, 
            // if UserManager works, it returns Ok with the created users
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            var content = await response.Content.ReadAsStringAsync();
            Assert.Contains("createdCount", content, StringComparison.OrdinalIgnoreCase);
        }

        [Fact]
        public async Task GetRoles_ShouldReturn200()
        {
            var response = await Client.GetAsync($"{BaseUrl}/roles");
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }

        [Fact]
        public async Task GetPermissions_ShouldReturn200()
        {
            var response = await Client.GetAsync($"{BaseUrl}/permissions");
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }
    }
}

using System;
using System.Collections.Generic;
using System.Net;
using System.Net.Http.Json;
using System.Threading.Tasks;
using EDR.API.Tests.Infrastructure;
using EDR.Domain.Entities;
using Xunit;

namespace EDR.API.Tests.Integration
{
    public class AuditControllerIntegrationTests : IntegrationTestBase
    {
        private const string BaseUrl = "/api/Audit";

        [Fact]
        public async Task TestAudit_ShouldReturn200()
        {
            // Act
            // Post without content for parameterless action
            var response = await Client.PostAsync($"{BaseUrl}/test", null);

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }

        [Fact]
        public async Task GetAuditLogsByEntity_ShouldReturn200()
        {
            // Arrange
            var entityName = "TestEntity";
            var entityId = "123";

            // Act
            var response = await Client.GetAsync($"{BaseUrl}/entity/{entityName}/{entityId}");

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }

        [Fact]
        public async Task GetAuditLogsByUser_ShouldReturn200()
        {
            // Arrange
            var changedBy = "TestUser";

            // Act
            var response = await Client.GetAsync($"{BaseUrl}/user/{changedBy}");

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }

        [Fact]
        public async Task GetAuditLogsByDateRange_ShouldReturn200()
        {
            // Arrange
            var startDate = DateTime.UtcNow.AddDays(-1).ToString("o");
            var endDate = DateTime.UtcNow.AddDays(1).ToString("o");

            // Act
            var response = await Client.GetAsync($"{BaseUrl}/daterange?startDate={startDate}&endDate={endDate}");

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }

        [Fact]
        public async Task GetAuditSummary_ShouldReturn200()
        {
            // Act
            var response = await Client.GetAsync($"{BaseUrl}/summary");

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }
    }
}

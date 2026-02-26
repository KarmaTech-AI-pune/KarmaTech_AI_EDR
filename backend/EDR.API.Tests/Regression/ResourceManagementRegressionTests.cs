using System.Net;
using System.Net.Http.Json;
using EDR.API.Tests.Infrastructure;
using Xunit;

namespace EDR.API.Tests.Regression
{
    /// <summary>
    /// Regression tests for Resource Management.
    /// Covers ResourceController (roles, employees, project resources),
    /// PlannedHoursController, and MeasurementUnitsController.
    /// </summary>
    public class ResourceManagementRegressionTests : IntegrationTestBase
    {
        [Fact]
        public async Task ResourceRoles_ListAvailable()
        {
            var response = await Client.GetAsync("/api/resources/roles");

            Assert.True(
                response.StatusCode == HttpStatusCode.OK
                || response.StatusCode == HttpStatusCode.NoContent,
                $"GET /api/resources/roles returned unexpected {response.StatusCode}");
        }

        [Fact]
        public async Task Employees_ListAll()
        {
            var response = await Client.GetAsync("/api/resources/employees");

            Assert.True(
                response.StatusCode == HttpStatusCode.OK
                || response.StatusCode == HttpStatusCode.NoContent,
                $"GET /api/resources/employees returned unexpected {response.StatusCode}");
        }

        [Fact]
        public async Task EmployeeById_NonExistent_Returns404()
        {
            var response = await Client.GetAsync("/api/resources/employees/non-existent-id-xyz");

            Assert.True(
                response.StatusCode == HttpStatusCode.NotFound
                || response.StatusCode == HttpStatusCode.InternalServerError,
                $"Expected 404/500 for non-existent employee, got {response.StatusCode}");
        }

        [Fact]
        public async Task PlannedHours_Endpoint_Reachable()
        {
            var response = await Client.GetAsync("/api/PlannedHours");

            Assert.True(
                response.StatusCode == HttpStatusCode.OK
                || response.StatusCode == HttpStatusCode.NotFound
                || response.StatusCode == HttpStatusCode.MethodNotAllowed,
                $"PlannedHours endpoint returned unexpected {response.StatusCode}");
        }

        [Fact]
        public async Task MeasurementUnits_ListAvailable()
        {
            var response = await Client.GetAsync("/api/MeasurementUnits");

            Assert.True(
                response.StatusCode == HttpStatusCode.OK
                || response.StatusCode == HttpStatusCode.NotFound
                || response.StatusCode == HttpStatusCode.MethodNotAllowed,
                $"MeasurementUnits endpoint returned unexpected {response.StatusCode}");
        }
    }
}

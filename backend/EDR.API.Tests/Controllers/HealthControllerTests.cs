using Microsoft.AspNetCore.Mvc;
using Xunit;
using EDR.API.Controllers;

namespace EDR.API.Tests.Controllers
{
    public class HealthControllerTests
    {
        private readonly HealthController _controller;

        public HealthControllerTests()
        {
            _controller = new HealthController();
        }

        [Fact]
        public void Get_ReturnsOk_WithHealthyMessage()
        {
            // Act
            var result = _controller.Get();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal("Healthy", okResult.Value);
        }
    }
}

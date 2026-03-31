using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;
using EDR.API.Controllers;

namespace EDR.API.Tests.Controllers
{
    public class VersionControllerTests
    {
        private readonly Mock<ILogger<VersionController>> _loggerMock;
        private readonly Mock<IConfiguration> _configMock;
        private readonly VersionController _controller;

        public VersionControllerTests()
        {
            _loggerMock = new Mock<ILogger<VersionController>>();
            _configMock = new Mock<IConfiguration>();

            _configMock.Setup(c => c["ASPNETCORE_ENVIRONMENT"]).Returns("Testing");

            _controller = new VersionController(_loggerMock.Object, _configMock.Object);
        }

        [Fact]
        public void GetVersion_ReturnsOk()
        {
            var result = _controller.GetVersion();

            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.NotNull(okResult.Value);
        }

        [Fact]
        public void GetHealth_ReturnsOk()
        {
            var result = _controller.GetHealth();

            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.NotNull(okResult.Value);
        }

        [Fact]
        public void GetMetrics_ReturnsOk()
        {
            var result = _controller.GetMetrics();

            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.NotNull(okResult.Value);
        }
    }
}

using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Moq;
using Xunit;
using EDR.API.Controllers;
using EDR.Application.Dtos;
using EDR.Application.Services;

namespace EDR.API.Tests.Controllers
{
    public class ScoringDescriptionControllerTests
    {
        private readonly Mock<IScoringDescriptionService> _serviceMock;
        private readonly ScoringDescriptionController _controller;

        public ScoringDescriptionControllerTests()
        {
            _serviceMock = new Mock<IScoringDescriptionService>();
            _controller = new ScoringDescriptionController(_serviceMock.Object);
        }

        [Fact]
        public async Task GetScoringDescriptions_ReturnsOk()
        {
            // IScoringDescriptionService.GetScoringDescriptionsAsync returns ScoringDescriptionDto (not List)
            _serviceMock.Setup(s => s.GetScoringDescriptionsAsync())
                .ReturnsAsync(new ScoringDescriptionDto());

            var result = await _controller.GetScoringDescriptions();

            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.NotNull(okResult.Value);
        }
    }
}

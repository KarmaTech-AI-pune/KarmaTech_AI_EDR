using MediatR;
using Microsoft.AspNetCore.Mvc;
using Moq;
using NJS.Application.CQRS.WorkBreakdownStructures.Queries;
using NJS.Application.Dtos;
using NJSAPI.Controllers;
using System.Threading;
using System.Threading.Tasks;
using Xunit;

namespace NJS.API.Tests.Controllers
{
    public class WBSOptionsControllerTests
    {
        private readonly Mock<IMediator> _mediatorMock;
        private readonly WBSOptionsController _controller;

        public WBSOptionsControllerTests()
        {
            _mediatorMock = new Mock<IMediator>();
            _controller = new WBSOptionsController(_mediatorMock.Object);
        }

        [Fact]
        public async Task GetWBSOptions_ReturnsOkResultWithOptions()
        {
            // Arrange
            var wbsOptions = new WBSLevelOptionsDto
            {
                Level1Options = new List<WBSOptionDto>
                {
                    new WBSOptionDto { Id = 1, Name = "Option 1", Level = 1 },
                    new WBSOptionDto { Id = 2, Name = "Option 2", Level = 1 }
                },
                Level2Options = new List<WBSOptionDto>
                {
                    new WBSOptionDto { Id = 3, Name = "Option 3", Level = 2, ParentId = 1 },
                    new WBSOptionDto { Id = 4, Name = "Option 4", Level = 2, ParentId = 1 }
                },
                Level3Options = new List<WBSOptionDto>
                {
                    new WBSOptionDto { Id = 5, Name = "Option 5", Level = 3, ParentId = 3 },
                    new WBSOptionDto { Id = 6, Name = "Option 6", Level = 3, ParentId = 3 }
                }
            };

            _mediatorMock.Setup(m => m.Send(It.IsAny<GetWBSOptionsQuery>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(wbsOptions);

            // Act
            var result = await _controller.GetWBSOptions();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var returnValue = Assert.IsType<WBSLevelOptionsDto>(okResult.Value);
            Assert.Equal(2, returnValue.Level1Options.Count);
            Assert.Equal(2, returnValue.Level2Options.Count);
            Assert.Equal(2, returnValue.Level3Options.Count);
        }

        [Fact]
        public async Task GetWBSOptionsByParentId_ReturnsOkResultWithOptions()
        {
            // Arrange
            var parentId = 1;
            var wbsOptions = new List<WBSOptionDto>
            {
                new WBSOptionDto { Id = 3, Name = "Option 3", Level = 2, ParentId = parentId },
                new WBSOptionDto { Id = 4, Name = "Option 4", Level = 2, ParentId = parentId }
            };

            _mediatorMock.Setup(m => m.Send(It.Is<GetWBSOptionsByParentIdQuery>(q => q.ParentId == parentId), It.IsAny<CancellationToken>()))
                .ReturnsAsync(wbsOptions);

            // Act
            var result = await _controller.GetWBSOptionsByParentId(parentId);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var returnValue = Assert.IsAssignableFrom<IEnumerable<WBSOptionDto>>(okResult.Value);
            Assert.Equal(2, ((List<WBSOptionDto>)returnValue).Count);
            Assert.All(returnValue, option => Assert.Equal(parentId, option.ParentId));
        }

        [Fact]
        public async Task GetWBSOptionsByLevel_ReturnsOkResultWithOptions()
        {
            // Arrange
            var level = 1;
            var wbsOptions = new List<WBSOptionDto>
            {
                new WBSOptionDto { Id = 1, Name = "Option 1", Level = level },
                new WBSOptionDto { Id = 2, Name = "Option 2", Level = level }
            };

            _mediatorMock.Setup(m => m.Send(It.Is<GetWBSOptionsByLevelQuery>(q => q.Level == level), It.IsAny<CancellationToken>()))
                .ReturnsAsync(wbsOptions);

            // Act
            var result = await _controller.GetWBSOptionsByLevel(level);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var returnValue = Assert.IsAssignableFrom<IEnumerable<WBSOptionDto>>(okResult.Value);
            Assert.Equal(2, ((List<WBSOptionDto>)returnValue).Count);
            Assert.All(returnValue, option => Assert.Equal(level, option.Level));
        }
    }
}

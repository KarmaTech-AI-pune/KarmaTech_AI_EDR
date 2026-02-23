using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using EDR.Application.DTOs;
using EDR.Application.CQRS.MonthlyProgress.Commands;
using EDR.Application.CQRS.MonthlyProgress.Queries;
using EDR.API.Controllers;
using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Xunit;
using Microsoft.AspNetCore.Http; // Added for StatusCodes

namespace EDR.API.Tests.Controllers
{
    public class MonthlyProgressControllerTests
    {
        private readonly Mock<IMediator> _mediator;
        private readonly Mock<ILogger<MonthlyProgressController>> _logger;
        private readonly MonthlyProgressController _controller;

        public MonthlyProgressControllerTests()
        {
            _mediator = new Mock<IMediator>();
            _logger = new Mock<ILogger<MonthlyProgressController>>();
            _controller = new MonthlyProgressController(_mediator.Object, _logger.Object);
        }

        [Fact]
        public async Task GetAllMonthlyProgressByProject_ShouldReturnOk_WhenRecordsExist()
        {
            // Arrange
            var list = new List<MonthlyProgressDto>
            {
                new MonthlyProgressDto { Id = 1, ProjectId = 5, Month = 1, Year = 2024 },
                new MonthlyProgressDto { Id = 2, ProjectId = 5, Month = 2, Year = 2024 }
            };
            _mediator.Setup(m => m.Send(It.IsAny<GetMonthlyProgressByProjectIdQuery>(), It.IsAny<CancellationToken>()))
                     .ReturnsAsync(list);

            // Act
            var result = await _controller.GetAllMonthlyProgressByProject(5);

            // Assert
            var ok = Assert.IsType<OkObjectResult>(result.Result);
            Assert.IsAssignableFrom<IEnumerable<MonthlyProgressDto>>(ok.Value);
        }

        [Fact]
        public async Task UpdateMonthlyProgressByYearMonth_ShouldReturnNoContent_WhenSuccessful()
        {
            // Arrange
            var existing = new MonthlyProgressDto { Id = 1, ProjectId = 5 };
            var updateDto = new CreateMonthlyProgressDto { Month = 5, Year = 2024 };
            _mediator.Setup(m => m.Send(It.IsAny<GetMonthlyProgressByProjectYearMonthQuery>(), It.IsAny<CancellationToken>()))
                     .ReturnsAsync(existing);
            _mediator.Setup(m => m.Send(It.IsAny<UpdateMonthlyProgressCommand>(), It.IsAny<CancellationToken>()))
                     .ReturnsAsync(true); // Return Task<bool>

            // Act
            var result = await _controller.UpdateMonthlyProgressByYearMonth(5, 2024, 5, updateDto);

            // Assert
            Assert.IsType<NoContentResult>(result);
        }

        [Fact]
        public async Task DeleteMonthlyProgressByYearMonth_ShouldReturnNoContent_WhenSuccessful()
        {
            // Arrange
            var existing = new MonthlyProgressDto { Id = 1, ProjectId = 5 };
            _mediator.Setup(m => m.Send(It.IsAny<GetMonthlyProgressByProjectYearMonthQuery>(), It.IsAny<CancellationToken>()))
                     .ReturnsAsync(existing);
            _mediator.Setup(m => m.Send(It.IsAny<DeleteMonthlyProgressCommand>(), It.IsAny<CancellationToken>()))
                     .ReturnsAsync(true); // Return Task<bool>

            // Act
            var result = await _controller.DeleteMonthlyProgressByYearMonth(5, 2024, 5);

            // Assert
            Assert.IsType<NoContentResult>(result);
        }

        [Fact]
        public async Task UpdateManpowerPlanning_ShouldReturnOk_WhenSuccessful()
        {
            // Arrange
            var manpowerDto = new ManpowerDto { WorkAssignment = "Test" };
            _mediator.Setup(m => m.Send(It.IsAny<UpdateManpowerPlanningCommand>(), It.IsAny<CancellationToken>()))
                     .ReturnsAsync(manpowerDto);

            // Act
            var result = await _controller.UpdateManpowerPlanning(5, 1, 1, manpowerDto);

            // Assert
            Assert.IsType<OkObjectResult>(result);
        }
    }
}

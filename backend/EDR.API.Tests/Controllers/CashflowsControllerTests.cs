using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;
using EDR.API.Controllers;
using EDR.Application.CQRS.Cashflow.Commands;
using EDR.Application.CQRS.Cashflow.Queries;
using EDR.Application.Dtos;
using EDR.Domain.Database;
using EDR.Domain.Entities;

namespace EDR.API.Tests.Controllers
{
    public class CashflowsControllerTests : IDisposable
    {
        private readonly Mock<IMediator> _mediatorMock;
        private readonly Mock<ILogger<CashflowsController>> _loggerMock;
        private readonly ProjectManagementContext _context;
        private readonly CashflowsController _controller;

        public CashflowsControllerTests()
        {
            _mediatorMock = new Mock<IMediator>();
            _loggerMock = new Mock<ILogger<CashflowsController>>();
            
            var options = new DbContextOptionsBuilder<ProjectManagementContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            
            _context = new ProjectManagementContext(options, null, null);
            _controller = new CashflowsController(_mediatorMock.Object, _loggerMock.Object, _context);
        }

        public void Dispose()
        {
            _context.Database.EnsureDeleted();
            _context.Dispose();
        }

        [Fact]
        public async Task GetAllCashflows_ReturnsOk_WhenSuccessful()
        {
            // Arrange
            var response = new MonthlyBudgetResponseDto 
            { 
                ProjectName = "Test", 
                Cashflows = new List<CashflowDto>(),
                Summary = new MonthlyBudgetSummaryDto()
            };
            
            _mediatorMock.Setup(m => m.Send(It.IsAny<GetAllCashflowsQuery>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(response);

            // Act
            var result = await _controller.GetAllCashflows(1);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.NotNull(okResult.Value);
        }

        [Fact]
        public async Task GetAllCashflows_ReturnsEmptyObject_WhenResultIsNull()
        {
            // Arrange
            _mediatorMock.Setup(m => m.Send(It.IsAny<GetAllCashflowsQuery>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync((MonthlyBudgetResponseDto)null);

            // Act
            var result = await _controller.GetAllCashflows(1);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.NotNull(okResult.Value);
        }

        [Fact]
        public async Task GetAllCashflows_Returns500_OnException()
        {
            // Arrange
            _mediatorMock.Setup(m => m.Send(It.IsAny<GetAllCashflowsQuery>(), It.IsAny<CancellationToken>()))
                .ThrowsAsync(new Exception("Database error"));

            // Act
            var result = await _controller.GetAllCashflows(1);

            // Assert
            var statusCodeResult = Assert.IsType<ObjectResult>(result);
            Assert.Equal(500, statusCodeResult.StatusCode);
        }

        [Fact]
        public async Task GetPaymentMilestones_ReturnsOk_WithData()
        {
            // Arrange
            _context.Projects.Add(new Project { Id = 1, TenantId = 1, EstimatedProjectFee = 10000 });
            await _context.SaveChangesAsync();

            var milestones = new List<PaymentMilestoneDto>
            {
                new PaymentMilestoneDto { Id = 1, Description = "M1", Percentage = 50, AmountINR = 5000 }
            };

            _mediatorMock.Setup(m => m.Send(It.IsAny<GetPaymentMilestonesQuery>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(milestones);

            // Act
            var result = await _controller.GetPaymentMilestones(1);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.NotNull(okResult.Value);
        }

        [Fact]
        public async Task GetPaymentMilestones_Returns500_OnException()
        {
            // Arrange
            _mediatorMock.Setup(m => m.Send(It.IsAny<GetPaymentMilestonesQuery>(), It.IsAny<CancellationToken>()))
                .ThrowsAsync(new Exception("Database error"));

            // Act
            var result = await _controller.GetPaymentMilestones(1);

            // Assert
            var statusCodeResult = Assert.IsType<ObjectResult>(result);
            Assert.Equal(500, statusCodeResult.StatusCode);
        }

        [Fact]
        public async Task CreatePaymentMilestone_ReturnsCreatedAtAction_WhenSuccessful()
        {
            // Arrange
            var command = new CreatePaymentMilestoneCommand { Description = "M1", Percentage = 10 };
            var response = new PaymentMilestoneDto { Id = 1, Description = "M1", Percentage = 10 };

            _mediatorMock.Setup(m => m.Send(It.IsAny<CreatePaymentMilestoneCommand>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(response);

            // Act
            var result = await _controller.CreatePaymentMilestone(1, command);

            // Assert
            var createdResult = Assert.IsType<CreatedAtActionResult>(result);
            Assert.Equal("GetPaymentMilestones", createdResult.ActionName);
        }
        
        [Fact]
        public async Task CreatePaymentMilestone_ReturnsBadRequest_OnException()
        {
            // Arrange
            var command = new CreatePaymentMilestoneCommand { Description = "M1", Percentage = 10 };

            _mediatorMock.Setup(m => m.Send(It.IsAny<CreatePaymentMilestoneCommand>(), It.IsAny<CancellationToken>()))
                .ThrowsAsync(new Exception("DB Error"));

            // Act
            var result = await _controller.CreatePaymentMilestone(1, command);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.NotNull(badRequestResult.Value);
        }
    }
}

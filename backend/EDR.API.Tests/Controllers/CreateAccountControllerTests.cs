using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;
using EDR.API.Controllers;
using EDR.Application.CQRS.CreateAccount;
using EDR.Application.DTOs;

namespace EDR.API.Tests.Controllers
{
    public class CreateAccountControllerTests
    {
        private readonly Mock<IMediator> _mediatorMock;
        private readonly Mock<ILogger<CreateAccountController>> _loggerMock;
        private readonly CreateAccountController _controller;

        public CreateAccountControllerTests()
        {
            _mediatorMock = new Mock<IMediator>();
            _loggerMock = new Mock<ILogger<CreateAccountController>>();
            _controller = new CreateAccountController(_mediatorMock.Object, _loggerMock.Object);
        }

        [Fact]
        public async Task CreateAccount_ReturnsCreatedAtAction_WhenSuccessful()
        {
            // Arrange
            var dto = new CreateAccountDto { EmailAddress = "test@test.com", Subdomain = "test" };
            _mediatorMock.Setup(m => m.Send(It.IsAny<CreateAccountCommand>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(true);

            // Act
            var result = await _controller.CreateAccount(dto);

            // Assert
            var createdResult = Assert.IsType<CreatedAtActionResult>(result);
            Assert.Equal("CreateAccount", createdResult.ActionName);
        }

        [Fact]
        public async Task CreateAccount_ReturnsBadRequest_WhenFailed()
        {
            // Arrange
            var dto = new CreateAccountDto { EmailAddress = "test@test.com", Subdomain = "test" };
            _mediatorMock.Setup(m => m.Send(It.IsAny<CreateAccountCommand>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(false);

            // Act
            var result = await _controller.CreateAccount(dto);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.NotNull(badRequestResult.Value);
        }

        [Fact]
        public async Task CreateAccount_ReturnsConflict_OnDuplicateEmail()
        {
            // Arrange
            var dto = new CreateAccountDto { EmailAddress = "test@test.com", Subdomain = "test" };
            _mediatorMock.Setup(m => m.Send(It.IsAny<CreateAccountCommand>(), It.IsAny<CancellationToken>()))
                .ThrowsAsync(new DuplicateEmailException("Email exists"));

            // Act
            var result = await _controller.CreateAccount(dto);

            // Assert
            var conflictResult = Assert.IsType<ConflictObjectResult>(result);
            Assert.NotNull(conflictResult.Value);
        }

        [Fact]
        public async Task CreateAccount_ReturnsConflict_OnDuplicateSubdomain()
        {
            // Arrange
            var dto = new CreateAccountDto { EmailAddress = "test@test.com", Subdomain = "test" };
            _mediatorMock.Setup(m => m.Send(It.IsAny<CreateAccountCommand>(), It.IsAny<CancellationToken>()))
                .ThrowsAsync(new DuplicateSubdomainException("Subdomain exists"));

            // Act
            var result = await _controller.CreateAccount(dto);

            // Assert
            var conflictResult = Assert.IsType<ConflictObjectResult>(result);
            Assert.NotNull(conflictResult.Value);
        }

        [Fact]
        public async Task CreateAccount_Returns500_OnGeneralException()
        {
            // Arrange
            var dto = new CreateAccountDto { EmailAddress = "test@test.com", Subdomain = "test" };
            _mediatorMock.Setup(m => m.Send(It.IsAny<CreateAccountCommand>(), It.IsAny<CancellationToken>()))
                .ThrowsAsync(new Exception("DB Error"));

            // Act
            var result = await _controller.CreateAccount(dto);

            // Assert
            var statusCodeResult = Assert.IsType<ObjectResult>(result);
            Assert.Equal(500, statusCodeResult.StatusCode);
        }
    }
}

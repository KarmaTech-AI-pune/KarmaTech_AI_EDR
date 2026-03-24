using System;
using System.Threading;
using System.Threading.Tasks;
using Moq;
using Xunit;
using EDR.Application.CQRS.Email.Commands;
using EDR.Application.Services.IContract;
using EDR.Domain.Models;

namespace EDR.API.Tests.CQRS.Email
{
    public class SendEmailCommandHandlerTests
    {
        private readonly Mock<IEmailService> _mockEmailService;
        private readonly SendEmailCommandHandler _handler;

        public SendEmailCommandHandlerTests()
        {
            _mockEmailService = new Mock<IEmailService>();
            _handler = new SendEmailCommandHandler(_mockEmailService.Object);
        }

        [Fact]
        public async Task Handle_ValidRequest_CallsEmailServiceAndReturnsTrue()
        {
            // Arrange
            var command = new SendEmailCommand
            {
                To = "test@example.com",
                Subject = "Test Subject",
                Body = "Test Body",
                IsHtml = true
            };

            // Act
            var result = await _handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.True(result);
            _mockEmailService.Verify(s => s.SendEmailAsync(It.Is<EmailMessage>(m => 
                m.To == command.To && 
                m.Subject == command.Subject && 
                m.Body == command.Body && 
                m.IsHtml == command.IsHtml)), Times.Once);
        }

        [Fact]
        public async Task Handle_ServiceThrowsException_ReturnsFalse()
        {
            // Arrange
            var command = new SendEmailCommand { To = "error@example.com" };
            _mockEmailService.Setup(s => s.SendEmailAsync(It.IsAny<EmailMessage>()))
                .ThrowsAsync(new Exception("SMTP failure"));

            // Act
            var result = await _handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.False(result);
        }
    }
}

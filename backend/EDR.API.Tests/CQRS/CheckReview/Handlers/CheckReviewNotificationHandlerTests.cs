using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;
using EDR.Application.CQRS.CheckReview.Handlers;
using EDR.Application.CQRS.CheckReview.Notifications;
using EDR.Application.Services.IContract;
using EDR.Domain.Models;
using EDR.Domain.Entities;
using EDR.Domain.Enums;

namespace EDR.API.Tests.CQRS.CheckReview.Handlers
{
    public class CheckReviewNotificationHandlerTests
    {
        private readonly Mock<IEmailService> _mockEmailService;
        private readonly Mock<ILogger<CheckReviewStatusEmailNotificationHandler>> _mockLogger;

        public CheckReviewNotificationHandlerTests()
        {
            _mockEmailService = new Mock<IEmailService>();
            _mockLogger = new Mock<ILogger<CheckReviewStatusEmailNotificationHandler>>();
        }

        [Fact]
        public async Task Handle_SendsEmailWithCorrectSubjectAndBody()
        {
            // Arrange
            var handler = new CheckReviewStatusEmailNotificationHandler(_mockEmailService.Object, _mockLogger.Object);
            var checkReview = new EDR.Domain.Entities.CheckReview { ActivityName = "Test Activity" };
            var notification = new CheckReviewStatusEmailNotification(
                checkReview, "User A", "Great job", "recipient@test.com", PMWorkflowStatusEnum.Approved);

            // Act
            await handler.Handle(notification, CancellationToken.None);

            // Assert
            _mockEmailService.Verify(s => s.SendEmailAsync(It.Is<EmailMessage>(m => 
                m.To == "recipient@test.com" && 
                m.Subject.Contains("Approved") && 
                m.Body.Contains("approved"))), Times.Once);
        }

        [Fact]
        public async Task Handle_LogsError_WhenEmailServiceThrows()
        {
            // Arrange
            var handler = new CheckReviewStatusEmailNotificationHandler(_mockEmailService.Object, _mockLogger.Object);
            var checkReview = new EDR.Domain.Entities.CheckReview { ActivityName = "Test Activity" };
            var notification = new CheckReviewStatusEmailNotification(
                checkReview, "User A", "Great job", "recipient@test.com", PMWorkflowStatusEnum.Approved);

            _mockEmailService.Setup(s => s.SendEmailAsync(It.IsAny<EmailMessage>()))
                .ThrowsAsync(new Exception("SMTP failure"));

            // Act
            await handler.Handle(notification, CancellationToken.None);

            // Assert
            _mockLogger.Verify(l => l.Log(
                LogLevel.Error,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((v, t) => v.ToString().Contains("Email sending failed")),
                It.IsAny<Exception>(),
                It.IsAny<Func<It.IsAnyType, Exception, string>>()), Times.Once);
        }
    }
}

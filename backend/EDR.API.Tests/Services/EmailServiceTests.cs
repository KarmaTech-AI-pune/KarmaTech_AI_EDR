using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Moq;
using NJS.Application.Services;
using NJS.Domain.Database;
using NJS.Domain.Entities;
using NJS.Domain.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Xunit;

namespace NJS.API.Tests.Services
{
    public class EmailServiceTests
    {
        private readonly Mock<IOptions<EmailSettings>> _emailSettingsMock;
        private readonly Mock<ProjectManagementContext> _dbContextMock;
        private readonly Mock<ILogger<EmailService>> _loggerMock;
        private readonly Mock<DbSet<FailedEmailLog>> _failedEmailLogsMock;
        private readonly EmailService _service;

        public EmailServiceTests()
        {
            // Setup email settings
            var emailSettings = new EmailSettings
            {
                SmtpServer = "smtp.test.com",
                Port = 587,
                Username = "test@example.com",
                Password = "password",
                FromEmail = "noreply@example.com",
                FromName = "Test System",
                EnableSsl = true,
                EnableEmailNotifications = false // Disable actual sending for tests
            };

            _emailSettingsMock = new Mock<IOptions<EmailSettings>>();
            _emailSettingsMock.Setup(x => x.Value).Returns(emailSettings);

            // Setup DbContext and DbSet mocks
            _dbContextMock = new Mock<ProjectManagementContext>(new DbContextOptions<ProjectManagementContext>());
            _failedEmailLogsMock = new Mock<DbSet<FailedEmailLog>>();
            _dbContextMock.Setup(c => c.FailedEmailLogs).Returns(_failedEmailLogsMock.Object);

            // Setup logger
            _loggerMock = new Mock<ILogger<EmailService>>();

            // Create service
            _service = new EmailService(_emailSettingsMock.Object, _dbContextMock.Object, _loggerMock.Object);
        }

        [Fact]
        public async Task SendEmailAsync_WithDisabledNotifications_ShouldLogAndNotSend()
        {
            // Arrange
            var message = new EmailMessage
            {
                To = "recipient@example.com",
                Subject = "Test Subject",
                Body = "Test Body",
                IsHtml = true
            };

            // Act
            await _service.SendEmailAsync(message);

            // Assert
            // Verify that no email was actually sent (we can't directly verify this without mocking SMTP client)
            // But we can verify that the logger was called
            _loggerMock.Verify(
                x => x.Log(
                    LogLevel.Information,
                    It.IsAny<EventId>(),
                    It.Is<It.IsAnyType>((v, t) => v.ToString().Contains("Skipping email")),
                    It.IsAny<Exception>(),
                    It.IsAny<Func<It.IsAnyType, Exception, string>>()),
                Times.AtLeastOnce);
        }

        [Fact]
        public async Task SendBulkEmailAsync_WithDisabledNotifications_ShouldLogAndNotSend()
        {
            // Arrange
            var messages = new List<EmailMessage>
            {
                new EmailMessage
                {
                    To = "recipient1@example.com",
                    Subject = "Test Subject 1",
                    Body = "Test Body 1",
                    IsHtml = true
                },
                new EmailMessage
                {
                    To = "recipient2@example.com",
                    Subject = "Test Subject 2",
                    Body = "Test Body 2",
                    IsHtml = true
                }
            };

            // Act
            await _service.SendBulkEmailAsync(messages);

            // Assert
            _loggerMock.Verify(
                x => x.Log(
                    LogLevel.Information,
                    It.IsAny<EventId>(),
                    It.Is<It.IsAnyType>((v, t) => v.ToString().Contains("Skipping bulk emails")),
                    It.IsAny<Exception>(),
                    It.IsAny<Func<It.IsAnyType, Exception, string>>()),
                Times.AtLeastOnce);
        }

        [Fact]
        public async Task GetFailedEmailsAsync_ShouldReturnFailedEmails()
        {
            // Arrange
            var failedEmails = new List<FailedEmailLog>
            {
                new FailedEmailLog
                {
                    Id = 1,
                    To = "recipient1@example.com",
                    Subject = "Failed Email 1",
                    Body = "Body 1",
                    ErrorMessage = "Error 1",
                    AttemptedAt = DateTime.UtcNow.AddHours(-1),
                    IsResolved = false
                },
                new FailedEmailLog
                {
                    Id = 2,
                    To = "recipient2@example.com",
                    Subject = "Failed Email 2",
                    Body = "Body 2",
                    ErrorMessage = "Error 2",
                    AttemptedAt = DateTime.UtcNow.AddHours(-2),
                    IsResolved = false
                }
            }.AsQueryable();

            // Setup mock DbSet
            _failedEmailLogsMock.As<IQueryable<FailedEmailLog>>().Setup(m => m.Provider).Returns(failedEmails.Provider);
            _failedEmailLogsMock.As<IQueryable<FailedEmailLog>>().Setup(m => m.Expression).Returns(failedEmails.Expression);
            _failedEmailLogsMock.As<IQueryable<FailedEmailLog>>().Setup(m => m.ElementType).Returns(failedEmails.ElementType);
            _failedEmailLogsMock.As<IQueryable<FailedEmailLog>>().Setup(m => m.GetEnumerator()).Returns(failedEmails.GetEnumerator());

            // Act
            var result = await _service.GetFailedEmailsAsync();

            // Assert
            Assert.Equal(2, result.Count);
            Assert.Contains(result, e => e.Id == 1);
            Assert.Contains(result, e => e.Id == 2);
        }

        [Fact]
        public async Task RetryFailedEmailAsync_WithValidId_ShouldUpdateFailedEmail()
        {
            // Arrange
            var failedEmailId = 1;
            var failedEmail = new FailedEmailLog
            {
                Id = failedEmailId,
                To = "recipient@example.com",
                Subject = "Failed Email",
                Body = "Body",
                ErrorMessage = "Error",
                AttemptedAt = DateTime.UtcNow.AddHours(-1),
                IsResolved = false
            };

            _dbContextMock.Setup(c => c.FailedEmailLogs.FindAsync(failedEmailId))
                .ReturnsAsync(failedEmail);

            // Act
            await _service.RetryFailedEmailAsync(failedEmailId);

            // Assert
            // Since notifications are disabled, the email should be marked as resolved
            Assert.True(failedEmail.IsResolved);
            _dbContextMock.Verify(c => c.SaveChangesAsync(default), Times.Once);
        }

        [Fact]
        public async Task RetryFailedEmailAsync_WithInvalidId_ShouldThrowException()
        {
            // Arrange
            var failedEmailId = 999;
            _dbContextMock.Setup(c => c.FailedEmailLogs.FindAsync(failedEmailId))
                .ReturnsAsync((FailedEmailLog)null);

            // Act & Assert
            await Assert.ThrowsAsync<ArgumentException>(() => _service.RetryFailedEmailAsync(failedEmailId));
        }
    }
}

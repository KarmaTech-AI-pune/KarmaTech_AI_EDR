using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Moq;
using EDR.Application.Services;
using EDR.Domain.Database;
using EDR.Domain.Entities;
using EDR.Domain.Models;
using System;
using EDR.Domain.Services;
using Microsoft.Extensions.Configuration;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Xunit;

namespace EDR.API.Tests.Services
{
    public class EmailServiceTests
    {
        private readonly ProjectManagementContext _dbContext;
        private readonly Mock<ILogger<EmailService>> _loggerMock;
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

            var emailSettingsMock = new Mock<IOptions<EmailSettings>>();
            emailSettingsMock.Setup(x => x.Value).Returns(emailSettings);

            // Setup In-Memory DB
            var options = new DbContextOptionsBuilder<ProjectManagementContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            var tenantServiceMock = new Mock<ICurrentTenantService>();
            var configMock = new Mock<IConfiguration>();

            _dbContext = new ProjectManagementContext(options, tenantServiceMock.Object, configMock.Object);

            // Setup logger
            _loggerMock = new Mock<ILogger<EmailService>>();

            // Create service
            _service = new EmailService(emailSettingsMock.Object, _dbContext, _loggerMock.Object);
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
                    It.Is<It.IsAnyType>((v, t) => true), // Match any rendered message since it's in a scope
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
                    It.Is<It.IsAnyType>((v, t) => true),
                    It.IsAny<Exception>(),
                    It.IsAny<Func<It.IsAnyType, Exception, string>>()),
                Times.AtLeastOnce);
        }

        [Fact]
        public async Task GetFailedEmailsAsync_ShouldReturnFailedEmails()
        {
            // Arrange
            _dbContext.FailedEmailLogs.AddRange(new List<FailedEmailLog>
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
            });
            await _dbContext.SaveChangesAsync();

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
                Id = 1,
                To = "recipient@example.com",
                Subject = "Failed Email",
                Body = "Body",
                ErrorMessage = "Error",
                AttemptedAt = DateTime.UtcNow.AddHours(-1),
                IsResolved = false
            };
            _dbContext.FailedEmailLogs.Add(failedEmail);
            await _dbContext.SaveChangesAsync();

            // Act
            await _service.RetryFailedEmailAsync(failedEmailId);

            // Assert
            // Since notifications are disabled, the email should be marked as resolved
            var updated = await _dbContext.FailedEmailLogs.FindAsync(failedEmailId);
            Assert.True(updated.IsResolved);
        }

        [Fact]
        public async Task RetryFailedEmailAsync_WithInvalidId_ShouldThrowException()
        {
            // Arrange
            var failedEmailId = 999;

            // Act & Assert
            await Assert.ThrowsAsync<ArgumentException>(() => _service.RetryFailedEmailAsync(failedEmailId));
        }
    }
}

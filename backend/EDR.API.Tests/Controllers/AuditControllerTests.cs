using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Moq;
using Xunit;
using EDR.API.Controllers;
using EDR.Domain.Entities;
using EDR.Domain.Services;
using EDR.Domain.Events;

namespace EDR.API.Tests.Controllers
{
    public class AuditControllerTests
    {
        private readonly Mock<IAuditService> _auditServiceMock;
        private readonly AuditController _controller;

        public AuditControllerTests()
        {
            _auditServiceMock = new Mock<IAuditService>();
            _controller = new AuditController(_auditServiceMock.Object);
        }

        [Fact]
        public async Task TestAudit_ReturnsOk_WhenSuccessful()
        {
            // Act
            var result = await _controller.TestAudit();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal("Audit test completed successfully", okResult.Value);
            _auditServiceMock.Verify(a => a.LogAuditAsync(It.IsAny<AuditEvent>()), Times.Once);
        }

        [Fact]
        public async Task TestAudit_Returns500_WhenExceptionThrown()
        {
            // Arrange
            _auditServiceMock.Setup(a => a.LogAuditAsync(It.IsAny<AuditEvent>()))
                .ThrowsAsync(new Exception("Database error"));

            // Act
            var result = await _controller.TestAudit();

            // Assert
            var statusCodeResult = Assert.IsType<ObjectResult>(result);
            Assert.Equal(500, statusCodeResult.StatusCode);
            Assert.Contains("Database error", statusCodeResult.Value.ToString());
        }

        [Fact]
        public async Task GetAuditLogsByEntity_ReturnsOkWithLogs()
        {
            // Arrange
            var expectedLogs = new List<AuditLog> { new AuditLog() };
            _auditServiceMock.Setup(a => a.GetAuditLogsAsync("Task", "1"))
                .ReturnsAsync(expectedLogs);

            // Act
            var result = await _controller.GetAuditLogsByEntity("Task", "1");

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            Assert.Same(expectedLogs, okResult.Value);
        }

        [Fact]
        public async Task GetAuditLogsByEntity_Returns500_WhenExceptionThrown()
        {
            // Arrange
            _auditServiceMock.Setup(a => a.GetAuditLogsAsync(It.IsAny<string>(), It.IsAny<string>()))
                .ThrowsAsync(new Exception("Error"));

            // Act
            var result = await _controller.GetAuditLogsByEntity("Task", "1");

            // Assert
            var statusCodeResult = Assert.IsType<ObjectResult>(result.Result);
            Assert.Equal(500, statusCodeResult.StatusCode);
        }

        [Fact]
        public async Task GetAuditLogsByUser_ReturnsOkWithLogs()
        {
            // Arrange
            var expectedLogs = new List<AuditLog> { new AuditLog() };
            _auditServiceMock.Setup(a => a.GetAuditLogsByUserAsync("user1"))
                .ReturnsAsync(expectedLogs);

            // Act
            var result = await _controller.GetAuditLogsByUser("user1");

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            Assert.Same(expectedLogs, okResult.Value);
        }

        [Fact]
        public async Task GetAuditLogsByUser_Returns500_WhenExceptionThrown()
        {
            // Arrange
            _auditServiceMock.Setup(a => a.GetAuditLogsByUserAsync(It.IsAny<string>()))
                .ThrowsAsync(new Exception("Error"));

            // Act
            var result = await _controller.GetAuditLogsByUser("user1");

            // Assert
            var statusCodeResult = Assert.IsType<ObjectResult>(result.Result);
            Assert.Equal(500, statusCodeResult.StatusCode);
        }

        [Fact]
        public async Task GetAuditLogsByDateRange_ReturnsOkWithLogs()
        {
            // Arrange
            var expectedLogs = new List<AuditLog> { new AuditLog() };
            var start = DateTime.UtcNow.AddDays(-1);
            var end = DateTime.UtcNow;
            
            _auditServiceMock.Setup(a => a.GetAuditLogsByDateRangeAsync(start, end))
                .ReturnsAsync(expectedLogs);

            // Act
            var result = await _controller.GetAuditLogsByDateRange(start, end);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            Assert.Same(expectedLogs, okResult.Value);
        }

        [Fact]
        public async Task GetAuditLogsByDateRange_Returns500_WhenExceptionThrown()
        {
            // Arrange
            _auditServiceMock.Setup(a => a.GetAuditLogsByDateRangeAsync(It.IsAny<DateTime>(), It.IsAny<DateTime>()))
                .ThrowsAsync(new Exception("Error"));

            // Act
            var result = await _controller.GetAuditLogsByDateRange(DateTime.UtcNow, DateTime.UtcNow);

            // Assert
            var statusCodeResult = Assert.IsType<ObjectResult>(result.Result);
            Assert.Equal(500, statusCodeResult.StatusCode);
        }

        [Fact]
        public async Task GetAuditSummary_ReturnsOkWithSummary()
        {
            // Arrange
            var logs = new List<AuditLog> 
            { 
                new AuditLog { Action = "Create", EntityName = "Project", ChangedBy = "user1" },
                new AuditLog { Action = "Update", EntityName = "Project", ChangedBy = "user2" },
                new AuditLog { Action = "Create", EntityName = "Task", ChangedBy = "user1" }
            };
            
            _auditServiceMock.Setup(a => a.GetAuditLogsByDateRangeAsync(It.IsAny<DateTime>(), It.IsAny<DateTime>()))
                .ReturnsAsync(logs);

            // Act
            var result = await _controller.GetAuditSummary(null, null);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            Assert.NotNull(okResult.Value);
            
            // Verify properties exist dynamically
            var summary = okResult.Value;
            var totalCountProp = summary.GetType().GetProperty("TotalAuditLogs");
            Assert.NotNull(totalCountProp);
            Assert.Equal(3, totalCountProp.GetValue(summary));
        }

        [Fact]
        public async Task GetAuditSummary_Returns500_WhenExceptionThrown()
        {
            // Arrange
            _auditServiceMock.Setup(a => a.GetAuditLogsByDateRangeAsync(It.IsAny<DateTime>(), It.IsAny<DateTime>()))
                .ThrowsAsync(new Exception("Summary Error"));

            // Act
            var result = await _controller.GetAuditSummary(null, null);

            // Assert
            var statusCodeResult = Assert.IsType<ObjectResult>(result.Result);
            Assert.Equal(500, statusCodeResult.StatusCode);
        }
    }
}

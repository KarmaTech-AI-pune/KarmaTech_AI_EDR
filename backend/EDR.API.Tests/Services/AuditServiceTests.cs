using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Moq;
using EDR.Domain.Database;
using EDR.Domain.Entities;
using EDR.Domain.Events;
using EDR.Domain.Services;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using Xunit;

namespace EDR.API.Tests.Services
{
    public class AuditServiceTests
    {
        private readonly Mock<IServiceProvider> _serviceProviderMock;
        private readonly Mock<ILogger<AuditService>> _loggerMock;
        private readonly AuditService _auditService;

        public AuditServiceTests()
        {
            _serviceProviderMock = new Mock<IServiceProvider>();
            _loggerMock = new Mock<ILogger<AuditService>>();
            _auditService = new AuditService(_serviceProviderMock.Object, _loggerMock.Object);
        }

        [Fact]
        public async Task LogAuditAsync_ShouldCreateNewScopeAndSaveAuditLog()
        {
            // Arrange
            var mockScope = new Mock<IServiceScope>();
            var mockScopeFactory = new Mock<IServiceScopeFactory>();
            var mockContext = new Mock<ProjectManagementContext>();
            var mockAuditLogs = new Mock<DbSet<AuditLog>>();

            _serviceProviderMock.Setup(x => x.GetService(typeof(IServiceScopeFactory)))
                .Returns(mockScopeFactory.Object);
            mockScopeFactory.Setup(x => x.CreateScope())
                .Returns(mockScope.Object);
            mockScope.Setup(x => x.ServiceProvider)
                .Returns(_serviceProviderMock.Object);
            _serviceProviderMock.Setup(x => x.GetService(typeof(ProjectManagementContext)))
                .Returns(mockContext.Object);
            mockContext.Setup(x => x.AuditLogs)
                .Returns(mockAuditLogs.Object);

            var auditEvent = new AuditEvent(
                "TestEntity",
                "Created",
                "123",
                "{}",
                "{\"Name\":\"Test\"}",
                "TestUser",
                DateTime.UtcNow,
                "Test reason",
                "127.0.0.1",
                "TestAgent"
            );

            // Act
            await _auditService.LogAuditAsync(auditEvent);

            // Assert
            mockScopeFactory.Verify(x => x.CreateScope(), Times.Once);
            mockScope.Verify(x => x.Dispose(), Times.Once);
            mockAuditLogs.Verify(x => x.Add(It.IsAny<AuditLog>()), Times.Once);
            mockContext.Verify(x => x.SaveChangesAsync(default), Times.Once);
        }

        [Fact]
        public async Task GetAuditLogsAsync_ShouldCreateNewScopeAndReturnLogs()
        {
            // Arrange
            var mockScope = new Mock<IServiceScope>();
            var mockScopeFactory = new Mock<IServiceScopeFactory>();
            var mockContext = new Mock<ProjectManagementContext>();
            var mockAuditLogs = new Mock<DbSet<AuditLog>>();

            var testLogs = new List<AuditLog>
            {
                new AuditLog { Id = 1, EntityName = "TestEntity", EntityId = "123", Action = "Created" },
                new AuditLog { Id = 2, EntityName = "TestEntity", EntityId = "123", Action = "Updated" }
            }.AsQueryable();

            _serviceProviderMock.Setup(x => x.GetService(typeof(IServiceScopeFactory)))
                .Returns(mockScopeFactory.Object);
            mockScopeFactory.Setup(x => x.CreateScope())
                .Returns(mockScope.Object);
            mockScope.Setup(x => x.ServiceProvider)
                .Returns(_serviceProviderMock.Object);
            _serviceProviderMock.Setup(x => x.GetService(typeof(ProjectManagementContext)))
                .Returns(mockContext.Object);
            mockContext.Setup(x => x.AuditLogs)
                .Returns(mockAuditLogs.Object);
            mockAuditLogs.Setup(x => x.Where(It.IsAny<Expression<Func<AuditLog, bool>>>()))
                .Returns(testLogs);

            // Act
            var result = await _auditService.GetAuditLogsAsync("TestEntity", "123");

            // Assert
            mockScopeFactory.Verify(x => x.CreateScope(), Times.Once);
            mockScope.Verify(x => x.Dispose(), Times.Once);
            Assert.Equal(2, result.Count());
        }

        [Fact]
        public async Task OnAuditEventAsync_ShouldCallLogAuditAsync()
        {
            // Arrange
            var mockScope = new Mock<IServiceScope>();
            var mockScopeFactory = new Mock<IServiceScopeFactory>();
            var mockContext = new Mock<ProjectManagementContext>();
            var mockAuditLogs = new Mock<DbSet<AuditLog>>();

            _serviceProviderMock.Setup(x => x.GetService(typeof(IServiceScopeFactory)))
                .Returns(mockScopeFactory.Object);
            mockScopeFactory.Setup(x => x.CreateScope())
                .Returns(mockScope.Object);
            mockScope.Setup(x => x.ServiceProvider)
                .Returns(_serviceProviderMock.Object);
            _serviceProviderMock.Setup(x => x.GetService(typeof(ProjectManagementContext)))
                .Returns(mockContext.Object);
            mockContext.Setup(x => x.AuditLogs)
                .Returns(mockAuditLogs.Object);

            var auditEvent = new AuditEvent(
                "TestEntity",
                "Created",
                "123",
                "{}",
                "{\"Name\":\"Test\"}",
                "TestUser",
                DateTime.UtcNow
            );

            // Act
            await _auditService.OnAuditEventAsync(auditEvent);

            // Assert
            mockAuditLogs.Verify(x => x.Add(It.IsAny<AuditLog>()), Times.Once);
            mockContext.Verify(x => x.SaveChangesAsync(default), Times.Once);
        }
    }
} 

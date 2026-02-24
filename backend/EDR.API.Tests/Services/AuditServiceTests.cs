using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
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
        private readonly Mock<ILogger<AuditService>> _loggerMock;
        private readonly IServiceProvider _serviceProvider;
        private readonly AuditService _auditService;

        public AuditServiceTests()
        {
            _loggerMock = new Mock<ILogger<AuditService>>();
            
            var dbName = Guid.NewGuid().ToString();
            var services = new ServiceCollection();
            services.AddDbContext<ProjectManagementContext>(options =>
                options.UseInMemoryDatabase(databaseName: dbName));
            
            services.AddScoped<ICurrentTenantService>(sp => new Mock<ICurrentTenantService>().Object);
            services.AddScoped<IConfiguration>(sp => new Mock<IConfiguration>().Object);
            
            _serviceProvider = services.BuildServiceProvider();
            _auditService = new AuditService(_serviceProvider, _loggerMock.Object);
        }

        [Fact]
        public async Task LogAuditAsync_ShouldCreateNewScopeAndSaveAuditLog()
        {
            // Arrange

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
            using var scope = _serviceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<ProjectManagementContext>();
            Assert.Single(context.AuditLogs);
            var log = context.AuditLogs.First();
            Assert.Equal("TestEntity", log.EntityName);
            Assert.Equal("Created", log.Action);
            Assert.Equal("123", log.EntityId);
        }

        [Fact]
        public async Task GetAuditLogsAsync_ShouldCreateNewScopeAndReturnLogs()
        {
            // Arrange
            using (var scope = _serviceProvider.CreateScope())
            {
                var context = scope.ServiceProvider.GetRequiredService<ProjectManagementContext>();
                context.AuditLogs.AddRange(
                    new AuditLog { EntityName = "TestEntity", EntityId = "123", Action = "Created", ChangedBy = "UserA", NewValues = "{}", OldValues = "{}" },
                    new AuditLog { EntityName = "TestEntity", EntityId = "123", Action = "Updated", ChangedBy = "UserA", NewValues = "{}", OldValues = "{}" },
                    new AuditLog { EntityName = "OtherEntity", EntityId = "456", Action = "Created", ChangedBy = "UserB", NewValues = "{}", OldValues = "{}" }
                );
                context.SaveChanges();
            }

            // Act
            var result = await _auditService.GetAuditLogsAsync("TestEntity", "123");

            // Assert
            Assert.Equal(2, result.Count());
        }

        [Fact]
        public async Task OnAuditEventAsync_ShouldCallLogAuditAsync()
        {
            // Arrange

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
            using var scope = _serviceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<ProjectManagementContext>();
            Assert.Single(context.AuditLogs);
        }
    }
} 

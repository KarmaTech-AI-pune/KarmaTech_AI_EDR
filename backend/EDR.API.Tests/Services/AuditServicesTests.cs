using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Moq;
using EDR.Domain.Events;
using EDR.Domain.Services;
using Xunit;
using System.Security.Claims;
using System.Collections.Generic;
using System.Threading.Tasks;

using Microsoft.Extensions.DependencyInjection;
using EDR.Domain.Database;
using EDR.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System;

namespace EDR.API.Tests.Services
{
    public class AuditServicesTests
    {
        [Fact]
        public void AuditContext_ReturnsCurrentUserName_WhenClaimExists()
        {
            // Arrange
            var mockAccessor = new Mock<IHttpContextAccessor>();
            var context = new DefaultHttpContext();
            var claims = new List<Claim> { new Claim(ClaimTypes.Name, "TestUser") };
            context.User = new ClaimsPrincipal(new ClaimsIdentity(claims));
            mockAccessor.Setup(x => x.HttpContext).Returns(context);

            var auditContext = new AuditContext(mockAccessor.Object);

            // Act
            var name = auditContext.GetCurrentUserName();

            // Assert
            Assert.Equal("TestUser", name);
        }

        [Fact]
        public void AuditContext_ReturnsEmail_WhenNameClaimMissing()
        {
            // Arrange
            var mockAccessor = new Mock<IHttpContextAccessor>();
            var context = new DefaultHttpContext();
            var claims = new List<Claim> { new Claim(ClaimTypes.Email, "test@example.com") };
            context.User = new ClaimsPrincipal(new ClaimsIdentity(claims));
            mockAccessor.Setup(x => x.HttpContext).Returns(context);

            var auditContext = new AuditContext(mockAccessor.Object);

            // Act
            var name = auditContext.GetCurrentUserName();

            // Assert
            Assert.Equal("test@example.com", name);
        }

        [Fact]
        public void AuditContext_ReturnsIpAddress()
        {
            // Arrange
            var mockAccessor = new Mock<IHttpContextAccessor>();
            var context = new DefaultHttpContext();
            context.Connection.RemoteIpAddress = System.Net.IPAddress.Parse("192.168.1.1");
            mockAccessor.Setup(x => x.HttpContext).Returns(context);

            var auditContext = new AuditContext(mockAccessor.Object);

            // Act
            var ip = auditContext.GetIpAddress();

            // Assert
            Assert.Equal("192.168.1.1", ip);
        }

        [Fact]
        public void AuditContext_ReturnsUserAgentAndReason()
        {
            // Arrange
            var mockAccessor = new Mock<IHttpContextAccessor>();
            var context = new DefaultHttpContext();
            context.Request.Headers["User-Agent"] = "TestAgent";
            context.Request.Headers["X-Audit-Reason"] = "TestReason";
            mockAccessor.Setup(x => x.HttpContext).Returns(context);

            var auditContext = new AuditContext(mockAccessor.Object);

            // Act
            var ua = auditContext.GetUserAgent();
            var reason = auditContext.GetReason();

            // Assert
            Assert.Equal("TestAgent", ua);
            Assert.Equal("TestReason", reason);
        }

        [Fact]
        public async Task AuditSubject_AttachesAndNotifiesObservers()
        {
            // Arrange
            var subject = new AuditSubject();
            var mockObserver = new Mock<IAuditObserver>();
            var mockEvent = new Mock<IAuditEvent>();
            
            subject.Attach(mockObserver.Object);

            // Act
            await subject.NotifyAsync(mockEvent.Object);

            // Assert
            mockObserver.Verify(x => x.OnAuditEventAsync(mockEvent.Object), Times.Once);
        }

        [Fact]
        public async Task AuditSubject_DetachesObservers()
        {
            // Arrange
            var subject = new AuditSubject();
            var mockObserverValue = new Mock<IAuditObserver>();
            var mockEvent = new Mock<IAuditEvent>();
            
            subject.Attach(mockObserverValue.Object);
            subject.Detach(mockObserverValue.Object);

            // Act
            await subject.NotifyAsync(mockEvent.Object);

            // Assert
            mockObserverValue.Verify(x => x.OnAuditEventAsync(mockEvent.Object), Times.Never);
        }

        [Fact]
        public async Task AuditLoggingObserver_LogsInformation()
        {
            // Arrange
            var mockLogger = new Mock<ILogger<AuditLoggingObserver>>();
            var observer = new AuditLoggingObserver(mockLogger.Object);
            var mockEvent = new Mock<IAuditEvent>();
            mockEvent.Setup(x => x.Action).Returns("Test");
            mockEvent.Setup(x => x.EntityName).Returns("Entity");

            // Act
            await observer.OnAuditEventAsync(mockEvent.Object);

            // Assert
            mockLogger.Verify(
                x => x.Log(
                    LogLevel.Information,
                    It.IsAny<EventId>(),
                    It.Is<It.IsAnyType>((v, t) => true),
                    It.IsAny<System.Exception>(),
                    It.IsAny<System.Func<It.IsAnyType, System.Exception, string>>()),
                Times.Once);
        }

        [Fact]
        public async Task AuditNotificationObserver_LogsWarning_OnCriticalEvent()
        {
            // Arrange
            var mockLogger = new Mock<ILogger<AuditNotificationObserver>>();
            var observer = new AuditNotificationObserver(mockLogger.Object);
            var mockEvent = new Mock<IAuditEvent>();
            mockEvent.Setup(x => x.Action).Returns("Deleted");
            mockEvent.Setup(x => x.EntityName).Returns("User");

            // Act
            await observer.OnAuditEventAsync(mockEvent.Object);

            // Assert
            mockLogger.Verify(
                x => x.Log(
                    LogLevel.Warning,
                    It.IsAny<EventId>(),
                    It.Is<It.IsAnyType>((v, t) => v.ToString().Contains("CRITICAL")),
                    It.IsAny<System.Exception>(),
                    It.IsAny<System.Func<It.IsAnyType, System.Exception, string>>()),
                Times.Once);
        }
        
        [Fact]
        public async Task AuditService_LogAuditAsync_SavesToDatabase()
        {
            // Arrange
            var services = new ServiceCollection();
            var options = new DbContextOptionsBuilder<ProjectManagementContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            
            var mockTenantService = new Mock<ICurrentTenantService>();
            var mockConfig = new Mock<Microsoft.Extensions.Configuration.IConfiguration>();
            
            services.AddScoped(sp => new ProjectManagementContext(options, mockTenantService.Object, mockConfig.Object));
            var serviceProvider = services.BuildServiceProvider();
            
            var mockLogger = new Mock<ILogger<AuditService>>();
            var auditService = new AuditService(serviceProvider, mockLogger.Object);
            
            var mockEvent = new Mock<IAuditEvent>();
            mockEvent.Setup(x => x.EntityName).Returns("Project");
            mockEvent.Setup(x => x.Action).Returns("Created");
            mockEvent.Setup(x => x.EntityId).Returns("1");
            mockEvent.Setup(x => x.ChangedBy).Returns("User");
            mockEvent.Setup(x => x.ChangedAt).Returns(DateTime.Now);
            mockEvent.Setup(x => x.OldValues).Returns("{}");
            mockEvent.Setup(x => x.NewValues).Returns("{}");

            // Act
            await auditService.LogAuditAsync(mockEvent.Object);

            // Assert
            using var scope = serviceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<ProjectManagementContext>();
            var log = await context.AuditLogs.FirstOrDefaultAsync();
            Assert.NotNull(log);
            Assert.Equal("Project", log.EntityName);
        }

        [Fact]
        public async Task AuditService_GetAuditLogsAsync_ReturnsLogs()
        {
             // Arrange
            var services = new ServiceCollection();
            var options = new DbContextOptionsBuilder<ProjectManagementContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            
            var mockTenantService = new Mock<ICurrentTenantService>();
            var mockConfig = new Mock<Microsoft.Extensions.Configuration.IConfiguration>();
            
            var context = new ProjectManagementContext(options, mockTenantService.Object, mockConfig.Object);
            context.AuditLogs.Add(new AuditLog { EntityName = "Project", EntityId = "1", Action = "Created", ChangedBy = "User", ChangedAt = DateTime.Now, OldValues = "{}", NewValues = "{}" });
            await context.SaveChangesAsync();

            services.AddScoped(sp => context);
            var serviceProvider = services.BuildServiceProvider();
            
            var mockLogger = new Mock<ILogger<AuditService>>();
            var auditService = new AuditService(serviceProvider, mockLogger.Object);

            // Act
            var logs = await auditService.GetAuditLogsAsync("Project", "1");

            // Assert
            Assert.Single(logs);
        }

        [Fact]
        public async Task AuditService_GetAuditLogsByUserAsync_ReturnsLogs()
        {
             // Arrange
            var services = new ServiceCollection();
            var options = new DbContextOptionsBuilder<ProjectManagementContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            
            var mockTenantService = new Mock<ICurrentTenantService>();
            var mockConfig = new Mock<Microsoft.Extensions.Configuration.IConfiguration>();
            
            var context = new ProjectManagementContext(options, mockTenantService.Object, mockConfig.Object);
            context.AuditLogs.Add(new AuditLog { EntityName = "Project", EntityId = "1", Action = "Created", ChangedBy = "TargetUser", ChangedAt = DateTime.Now, OldValues = "{}", NewValues = "{}" });
            await context.SaveChangesAsync();

            services.AddScoped(sp => context);
            var serviceProvider = services.BuildServiceProvider();
            
            var mockLogger = new Mock<ILogger<AuditService>>();
            var auditService = new AuditService(serviceProvider, mockLogger.Object);

            // Act
            var logs = await auditService.GetAuditLogsByUserAsync("TargetUser");

            // Assert
            Assert.Single(logs);
        }

        [Fact]
        public async Task AuditService_GetAuditLogsByDateRangeAsync_ReturnsLogs()
        {
             // Arrange
            var services = new ServiceCollection();
            var options = new DbContextOptionsBuilder<ProjectManagementContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            
            var mockTenantService = new Mock<ICurrentTenantService>();
            var mockConfig = new Mock<Microsoft.Extensions.Configuration.IConfiguration>();
            
            var context = new ProjectManagementContext(options, mockTenantService.Object, mockConfig.Object);
            var date = DateTime.Now;
            context.AuditLogs.Add(new AuditLog { EntityName = "Project", EntityId = "1", Action = "Created", ChangedBy = "User", ChangedAt = date, OldValues = "{}", NewValues = "{}" });
            await context.SaveChangesAsync();

            services.AddScoped(sp => context);
            var serviceProvider = services.BuildServiceProvider();
            
            var mockLogger = new Mock<ILogger<AuditService>>();
            var auditService = new AuditService(serviceProvider, mockLogger.Object);

            // Act
            var logs = await auditService.GetAuditLogsByDateRangeAsync(date.AddHours(-1), date.AddHours(1));

            // Assert
            Assert.Single(logs);
        }

        [Fact]
        public async Task AuditService_OnAuditEventAsync_CallsLogAuditAsync()
        {
            // Arrange
            var services = new ServiceCollection();
            var options = new DbContextOptionsBuilder<ProjectManagementContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            
            var mockTenantService = new Mock<ICurrentTenantService>();
            var mockConfig = new Mock<Microsoft.Extensions.Configuration.IConfiguration>();
            
            services.AddScoped(sp => new ProjectManagementContext(options, mockTenantService.Object, mockConfig.Object));
            var serviceProvider = services.BuildServiceProvider();
            
            var mockLogger = new Mock<ILogger<AuditService>>();
            var auditService = new AuditService(serviceProvider, mockLogger.Object);
            
            var mockEvent = new Mock<IAuditEvent>();
            mockEvent.Setup(x => x.EntityName).Returns("Project");
            mockEvent.Setup(x => x.Action).Returns("Created");
            mockEvent.Setup(x => x.EntityId).Returns("1");
            mockEvent.Setup(x => x.ChangedBy).Returns("User");
            mockEvent.Setup(x => x.ChangedAt).Returns(DateTime.Now);
            mockEvent.Setup(x => x.OldValues).Returns("{}");
            mockEvent.Setup(x => x.NewValues).Returns("{}");

            // Act
            await auditService.OnAuditEventAsync(mockEvent.Object);

            // Assert
            using var scope = serviceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<ProjectManagementContext>();
            var count = await context.AuditLogs.CountAsync();
            Assert.Equal(1, count);
        }
    }
}

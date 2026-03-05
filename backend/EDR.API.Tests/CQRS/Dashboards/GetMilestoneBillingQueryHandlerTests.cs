using EDR.Application.CQRS.Dashboard.MilestoneBilling.Handlers;
using EDR.Application.CQRS.Dashboard.MilestoneBilling.Queries;
using EDR.Domain.Database;
using EDR.Domain.Entities;
using EDR.Domain.Enums;
using EDR.Domain.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Moq;
using System;
using System.Threading;
using System.Threading.Tasks;
using Xunit;





namespace EDR.API.Tests.CQRS.Dashboards
{
    public class GetMilestoneBillingQueryHandlerTests : IDisposable
    {
        private readonly ProjectManagementContext _context;
        private readonly GetMilestoneBillingQueryHandler _handler;

        public GetMilestoneBillingQueryHandlerTests()
        {
            var options = new DbContextOptionsBuilder<ProjectManagementContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            var tenantServiceMock = new Mock<ICurrentTenantService>();
            tenantServiceMock.SetupProperty(t => t.TenantId, 1);
            var configMock = new Mock<IConfiguration>();

            _context = new ProjectManagementContext(options, tenantServiceMock.Object, configMock.Object);
            _handler = new GetMilestoneBillingQueryHandler(_context);
        }

        public void Dispose()
        {
            _context.Database.EnsureDeleted();
            _context.Dispose();
        }

        [Fact]
        public async Task Handle_ValidRequest_ReturnsMilestoneBilling()
        {
            // Arrange
            var project = new Project { Id = 1, Name = "Test Project", Status = ProjectStatus.Active, TenantId = 1 };
            _context.Projects.Add(project);

            var mp = new EDR.Domain.Entities.MonthlyProgress { Id = 1, ProjectId = 1, Year = 2023, Month = 10, TenantId = 1 };
            var deliverable = new ProgressDeliverable { Id = 1, MonthlyProgressId = 1, Milestone = "M1", PaymentDue = 1000, DueDateContract = DateTime.UtcNow.AddDays(10), TenantId = 1 };
            
            mp.ProgressDeliverables = new System.Collections.Generic.List<ProgressDeliverable> { deliverable };
            _context.MonthlyProgresses.Add(mp);

            await _context.SaveChangesAsync();

            var query = new GetMilestoneBillingQuery();

            // Act
            var result = await _handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.Single(result);
            Assert.Equal("M1", result[0].Milestone);
            Assert.Equal("On Track", result[0].Status);
        }
    }
}

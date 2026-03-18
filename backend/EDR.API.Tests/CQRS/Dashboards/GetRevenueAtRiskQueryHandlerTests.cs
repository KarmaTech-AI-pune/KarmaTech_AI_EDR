using EDR.Application.CQRS.Dashboard.RevenueAtRisk.Handler;
using EDR.Application.CQRS.Dashboard.RevenueAtRisk.Query;
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
    public class GetRevenueAtRiskQueryHandlerTests : IDisposable
    {
        private readonly ProjectManagementContext _context;
        private readonly GetRevenueAtRiskQueryHandler _handler;

        public GetRevenueAtRiskQueryHandlerTests()
        {
            var options = new DbContextOptionsBuilder<ProjectManagementContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            var tenantServiceMock = new Mock<ICurrentTenantService>();
            tenantServiceMock.SetupProperty(t => t.TenantId, 1);
            var configMock = new Mock<IConfiguration>();

            _context = new ProjectManagementContext(options, tenantServiceMock.Object, configMock.Object);
            _handler = new GetRevenueAtRiskQueryHandler(_context);
        }

        public void Dispose()
        {
            _context.Database.EnsureDeleted();
            _context.Dispose();
        }

        [Fact]
        public async Task Handle_ReturnsRevenueAtRisk()
        {
            // Arrange
            // Create on-hold project
            var p2 = new Project { Id = 2, Status = ProjectStatus.OnHold, TenantId = 1 };
            _context.Projects.Add(p2);

            var jsf2 = new EDR.Domain.Entities.JobStartForm { FormId = 2, ProjectId = 2, TotalProjectFees = 30000, TenantId = 1 };
            _context.JobStartForms.Add(jsf2);

            await _context.SaveChangesAsync();

            var query = new GetRevenueAtRiskQuery();

            // Act
            var result = await _handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(30000, result.RevenueAtRisk); // 30000
            Assert.Equal("1 projects affected", result.ProjectsAffectedDescription);
        }
    }
}

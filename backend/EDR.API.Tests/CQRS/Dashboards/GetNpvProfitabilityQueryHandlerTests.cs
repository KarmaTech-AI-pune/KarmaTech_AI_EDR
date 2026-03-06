using EDR.Application.CQRS.Dashboard.NpvProfitability.Handlers;
using EDR.Application.CQRS.Dashboard.NpvProfitability.Queries;
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
    public class GetNpvProfitabilityQueryHandlerTests : IDisposable
    {
        private readonly ProjectManagementContext _context;
        private readonly GetNpvProfitabilityQueryHandler _handler;

        public GetNpvProfitabilityQueryHandlerTests()
        {
            var options = new DbContextOptionsBuilder<ProjectManagementContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            var tenantServiceMock = new Mock<ICurrentTenantService>();
            tenantServiceMock.SetupProperty(t => t.TenantId, 1);
            var configMock = new Mock<IConfiguration>();

            _context = new ProjectManagementContext(options, tenantServiceMock.Object, configMock.Object);
            _handler = new GetNpvProfitabilityQueryHandler(_context);
        }

        public void Dispose()
        {
            _context.Database.EnsureDeleted();
            _context.Dispose();
        }

        [Fact]
        public async Task Handle_ValidRequest_ReturnsNpvProfitability()
        {
            // Arrange
            var project = new Project { Id = 1, Name = "Project 1", Status = ProjectStatus.Active, TenantId = 1 };
            _context.Projects.Add(project);

            var jsf = new EDR.Domain.Entities.JobStartForm { FormId = 1, ProjectId = 1, TotalProjectFees = 50000, ProfitPercentage = 25, TenantId = 1 };
            _context.JobStartForms.Add(jsf);

            await _context.SaveChangesAsync();

            var query = new GetNpvProfitabilityQuery();

            // Act
            var result = await _handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(50000, result.CurrentNpv);
            Assert.Equal(1, result.HighProfitProjectsCount);
            Assert.Equal(0, result.MediumProfitProjectsCount);
            Assert.Equal(0, result.LowProfitProjectsCount);
        }
    }
}

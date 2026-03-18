using EDR.Application.CQRS.Dashboard.Regional.Handlers;
using EDR.Application.CQRS.Dashboard.Regional.Queries;
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
    public class GetRegionalPortfolioQueryHandlerTests : IDisposable
    {
        private readonly ProjectManagementContext _context;
        private readonly GetRegionalPortfolioQueryHandler _handler;

        public GetRegionalPortfolioQueryHandlerTests()
        {
            var options = new DbContextOptionsBuilder<ProjectManagementContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            var tenantServiceMock = new Mock<ICurrentTenantService>();
            tenantServiceMock.SetupProperty(t => t.TenantId, 1);
            var configMock = new Mock<IConfiguration>();

            _context = new ProjectManagementContext(options, tenantServiceMock.Object, configMock.Object);
            _handler = new GetRegionalPortfolioQueryHandler(_context);
        }

        public void Dispose()
        {
            _context.Database.EnsureDeleted();
            _context.Dispose();
        }

        [Fact]
        public async Task Handle_ReturnsRegionalPortfolio()
        {
            // Arrange
            var currentYear = DateTime.UtcNow.Year;
            
            var project = new Project { Id = 1, Name = "Project 1", Region = "North America", StartDate = new DateTime(currentYear, 1, 1), EndDate = new DateTime(currentYear, 12, 31), TenantId = 1 };
            _context.Projects.Add(project);

            var jsf = new EDR.Domain.Entities.JobStartForm { FormId = 1, ProjectId = 1, TotalProjectFees = 500000, ProfitPercentage = 20, TenantId = 1 };
            _context.JobStartForms.Add(jsf);

            await _context.SaveChangesAsync();

            var query = new GetRegionalPortfolioQuery();

            // Act
            var result = await _handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.NotEmpty(result);
            Assert.Equal("North America", result[0].Region);
            Assert.Equal(500000, result[0].Revenue);
            Assert.Equal(20, result[0].Profit);
        }
    }
}

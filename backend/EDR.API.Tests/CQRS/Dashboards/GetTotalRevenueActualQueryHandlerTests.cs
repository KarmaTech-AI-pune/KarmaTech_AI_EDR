using EDR.Application.CQRS.Dashboard.TotalRevenueActual.Handlers;
using EDR.Application.CQRS.Dashboard.TotalRevenueActual.Queries;
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
    public class GetTotalRevenueActualQueryHandlerTests : IDisposable
    {
        private readonly ProjectManagementContext _context;
        private readonly GetTotalRevenueActualQueryHandler _handler;

        public GetTotalRevenueActualQueryHandlerTests()
        {
            var options = new DbContextOptionsBuilder<ProjectManagementContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            var tenantServiceMock = new Mock<ICurrentTenantService>();
            tenantServiceMock.SetupProperty(t => t.TenantId, 1);
            var configMock = new Mock<IConfiguration>();

            _context = new ProjectManagementContext(options, tenantServiceMock.Object, configMock.Object);
            _handler = new GetTotalRevenueActualQueryHandler(_context);
        }

        public void Dispose()
        {
            _context.Database.EnsureDeleted();
            _context.Dispose();
        }

        [Fact]
        public async Task Handle_ReturnsTotalRevenueActual()
        {
            // Arrange
            var currentYear = DateTime.Now.Year;
            var currentMonth = DateTime.Now.Month;
            
            var project = new Project { Id = 1, Name = "Project 1", Status = ProjectStatus.Active, TenantId = 1 };
            _context.Projects.Add(project);

            // Current Quarter Revenue
            var mp1 = new EDR.Domain.Entities.MonthlyProgress { Id = 1, ProjectId = 1, Year = currentYear, Month = currentMonth, TenantId = 1 };
            var fd1 = new FinancialDetails { Id = 1, MonthlyProgressId = 1, FeeTotal = 50000, TenantId = 1 };
            mp1.FinancialDetails = fd1;
            _context.MonthlyProgresses.Add(mp1);

            // Previous Quarter Revenue
            var prevQuarterDate = DateTime.Now.AddMonths(-3);
            var mp2 = new EDR.Domain.Entities.MonthlyProgress { Id = 2, ProjectId = 1, Year = prevQuarterDate.Year, Month = prevQuarterDate.Month, TenantId = 1 };
            var fd2 = new FinancialDetails { Id = 2, MonthlyProgressId = 2, FeeTotal = 40000, TenantId = 1 };
            mp2.FinancialDetails = fd2;
            _context.MonthlyProgresses.Add(mp2);

            await _context.SaveChangesAsync();

            var query = new GetTotalRevenueActualQuery();

            // Act
            var result = await _handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(50000, result.TotalRevenue);
            Assert.Equal("25.0% vs last quarter", result.ChangeDescription);
            Assert.Equal("positive", result.ChangeType);
        }
    }
}

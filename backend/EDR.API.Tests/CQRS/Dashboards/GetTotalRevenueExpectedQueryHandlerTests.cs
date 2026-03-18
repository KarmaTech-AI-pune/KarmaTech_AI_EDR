using EDR.Application.CQRS.Dashboard.TotalRevenueExpected.Handlers;
using EDR.Application.CQRS.Dashboard.TotalRevenueExpected.Queries;
using EDR.Domain.Database;
using EDR.Domain.Entities;
using EDR.Domain.Enums;
using EDR.Domain.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Moq;
using System;
using System.Threading;
using System.Threading.Tasks;
using Xunit;





namespace EDR.API.Tests.CQRS.Dashboards
{
    public class GetTotalRevenueExpectedQueryHandlerTests : IDisposable
    {
        private readonly ProjectManagementContext _context;
        private readonly Mock<ILogger<GetTotalRevenueExpectedQueryHandler>> _loggerMock;
        private readonly GetTotalRevenueExpectedQueryHandler _handler;

        public GetTotalRevenueExpectedQueryHandlerTests()
        {
            var options = new DbContextOptionsBuilder<ProjectManagementContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            var tenantServiceMock = new Mock<ICurrentTenantService>();
            tenantServiceMock.SetupProperty(t => t.TenantId, 1);
            var configMock = new Mock<IConfiguration>();

            _context = new ProjectManagementContext(options, tenantServiceMock.Object, configMock.Object);
            _loggerMock = new Mock<ILogger<GetTotalRevenueExpectedQueryHandler>>();
            _handler = new GetTotalRevenueExpectedQueryHandler(_context, _loggerMock.Object);
        }

        public void Dispose()
        {
            _context.Database.EnsureDeleted();
            _context.Dispose();
        }

        [Fact]
        public async Task Handle_ReturnsTotalRevenueExpected()
        {
            // Arrange
            var currentYear = DateTime.Now.Year;
            
            var project = new Project { Id = 1, Name = "Project 1", Status = ProjectStatus.Active, TenantId = 1 };
            _context.Projects.Add(project);

            // Current Quarter Revenue (Relative to now)
            var now = DateTime.Now;
            var currentQuarterDate = new DateTime(now.Year, ((now.Month - 1) / 3) * 3 + 1, 1);
            
            var jsf1 = new EDR.Domain.Entities.JobStartForm { FormId = 1, ProjectId = 1, TotalProjectFees = 100000, CreatedDate = currentQuarterDate, TenantId = 1 };
            _context.JobStartForms.Add(jsf1);
 
            // Previous Quarter Revenue
            var previousQuarterDate = currentQuarterDate.AddMonths(-3);
            
            var jsf2 = new EDR.Domain.Entities.JobStartForm { FormId = 2, ProjectId = 1, TotalProjectFees = 80000, CreatedDate = previousQuarterDate, TenantId = 1 };
            _context.JobStartForms.Add(jsf2);
 
            await _context.SaveChangesAsync();
 
            var query = new GetTotalRevenueExpectedQuery();
 
            // Act
            var result = await _handler.Handle(query, CancellationToken.None);
 
            // Assert
            Assert.NotNull(result);
 
            // Total revenue for the YEAR of 'now'
            var expectedTotal = 0.0m;
            if (jsf1.CreatedDate.Year == now.Year) expectedTotal += jsf1.TotalProjectFees;
            if (jsf2.CreatedDate.Year == now.Year) expectedTotal += jsf2.TotalProjectFees;
 
            Assert.Equal(expectedTotal, result.TotalRevenue); 
            Assert.Equal("25.0% vs last quarter", result.ChangeDescription);
            Assert.Equal("positive", result.ChangeType);
        }
    }
}

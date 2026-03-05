using EDR.Application.CQRS.Dashboard.ProjectsAtRisk.Handler;
using EDR.Application.CQRS.Dashboard.ProjectsAtRisk.Query;
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
    public class GetProjectsAtRiskQueryHandlerTests : IDisposable
    {
        private readonly ProjectManagementContext _context;
        private readonly Mock<ILogger<GetProjectsAtRiskQueryHandler>> _loggerMock;
        private readonly GetProjectsAtRiskQueryHandler _handler;

        public GetProjectsAtRiskQueryHandlerTests()
        {
            var options = new DbContextOptionsBuilder<ProjectManagementContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            var tenantServiceMock = new Mock<ICurrentTenantService>();
            tenantServiceMock.SetupProperty(t => t.TenantId, 1);
            var configMock = new Mock<IConfiguration>();

            _context = new ProjectManagementContext(options, tenantServiceMock.Object, configMock.Object);
            _loggerMock = new Mock<ILogger<GetProjectsAtRiskQueryHandler>>();
            _handler = new GetProjectsAtRiskQueryHandler(_context, _loggerMock.Object);
        }

        public void Dispose()
        {
            _context.Database.EnsureDeleted();
            _context.Dispose();
        }

        [Fact]
        public async Task Handle_ReturnsProjectsAtRisk()
        {
            // Arrange
            var pm = new User { Id = "pm1", Name = "Manager" };
            _context.Users.Add(pm);

            var project = new Project { Id = 1, Name = "Project 1", Status = ProjectStatus.Active, ProjectManagerId = "pm1", EstimatedProjectCost = 100000, Progress = 50, TenantId = 1 };
            _context.Projects.Add(project);

            var mp = new EDR.Domain.Entities.MonthlyProgress { Id = 1, ProjectId = 1, Year = 2023, Month = 10, TenantId = 1 };
            _context.MonthlyProgresses.Add(mp);

            var schedule = new Schedule { Id = 1, MonthlyProgressId = 1, CompletionDateAsPerContract = DateTime.Now.AddDays(-20), ExpectedCompletionDate = DateTime.Now, TenantId = 1 };
            _context.Schedules.Add(schedule);

            var cc = new ContractAndCost { Id = 1, MonthlyProgressId = 1, TotalCumulativeCost = 90000, TenantId = 1 };
            _context.ContractAndCosts.Add(cc);

            await _context.SaveChangesAsync();

            var query = new GetProjectsAtRiskQuery();

            // Act
            var result = await _handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.NotEmpty(result.Projects);
            Assert.Contains(result.Projects, p => p.Status == "falling_behind" || p.Status == "cost_overrun");
        }
    }
}

using EDR.Application.CQRS.Dashboard.ProfitMargin.Handler;
using EDR.Application.CQRS.Dashboard.ProfitMargin.Query;
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
    public class GetProfitMarginQueryHandlerTests : IDisposable
    {
        private readonly ProjectManagementContext _context;
        private readonly GetProfitMarginQueryHandler _handler;

        public GetProfitMarginQueryHandlerTests()
        {
            var options = new DbContextOptionsBuilder<ProjectManagementContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            var tenantServiceMock = new Mock<ICurrentTenantService>();
            tenantServiceMock.SetupProperty(t => t.TenantId, 1);
            var configMock = new Mock<IConfiguration>();

            _context = new ProjectManagementContext(options, tenantServiceMock.Object, configMock.Object);
            _handler = new GetProfitMarginQueryHandler(_context);
        }

        public void Dispose()
        {
            _context.Database.EnsureDeleted();
            _context.Dispose();
        }

        [Fact]
        public async Task Handle_ReturnsProfitMargin()
        {
            // Arrange
            var currentYear = DateTime.Now.Year;

            var project = new Project { Id = 1, Name = "Project 1", Status = ProjectStatus.Active, StartDate = new DateTime(currentYear, 1, 1), TenantId = 1 };
            _context.Projects.Add(project);

            var jsf = new EDR.Domain.Entities.JobStartForm { FormId = 1, ProjectId = 1, TotalProjectFees = 100000, TenantId = 1 };
            _context.JobStartForms.Add(jsf);

            var mp = new EDR.Domain.Entities.MonthlyProgress { Id = 1, ProjectId = 1, Year = currentYear, Month = DateTime.Now.Month, TenantId = 1 };
            var cc = new ContractAndCost { Id = 1, MonthlyProgressId = 1, TotalCumulativeCost = 60000, TenantId = 1 };
            mp.ContractAndCost = cc;
            _context.MonthlyProgresses.Add(mp);

            await _context.SaveChangesAsync();

            var query = new GetProfitMarginQuery();

            // Act
            var result = await _handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(40, result.ProfitMargin); // (100000 - 60000) / 100000 * 100 = 40%
        }
    }
}

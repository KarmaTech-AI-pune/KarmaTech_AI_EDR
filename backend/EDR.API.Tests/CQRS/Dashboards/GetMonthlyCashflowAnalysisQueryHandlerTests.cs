using EDR.Application.CQRS.Dashboard.Cashflow.Handlers;
using EDR.Application.CQRS.Dashboard.Cashflow.Queries;
using EDR.Domain.Database;
using EDR.Domain.Entities;
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
    public class GetMonthlyCashflowAnalysisQueryHandlerTests : IDisposable
    {
        private readonly ProjectManagementContext _context;
        private readonly GetMonthlyCashflowAnalysisQueryHandler _handler;

        public GetMonthlyCashflowAnalysisQueryHandlerTests()
        {
            var options = new DbContextOptionsBuilder<ProjectManagementContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            var tenantServiceMock = new Mock<ICurrentTenantService>();
            tenantServiceMock.SetupProperty(t => t.TenantId, 1);
            var configMock = new Mock<IConfiguration>();

            _context = new ProjectManagementContext(options, tenantServiceMock.Object, configMock.Object);
            _handler = new GetMonthlyCashflowAnalysisQueryHandler(_context);
        }

        public void Dispose()
        {
            _context.Database.EnsureDeleted();
            _context.Dispose();
        }

        [Fact]
        public async Task Handle_ValidRequest_ReturnsEmptyListWhenNoData()
        {
            // Arrange
            var query = new GetMonthlyCashflowAnalysisQuery();

            // Act
            var result = await _handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(12, result.Count); // Returns 12 empty months if no data
        }

        [Fact]
        public async Task Handle_WithData_ReturnsAnalysis()
        {
            // Arrange
            var project = new Project { Id = 1, Name = "Test Project", TenantId = 1 };
            _context.Projects.Add(project);

            var jsf = new EDR.Domain.Entities.JobStartForm { FormId = 1, ProjectId = 1, TotalProjectFees = 10000, TenantId = 1 };
            _context.JobStartForms.Add(jsf);

            var wbs = new WorkBreakdownStructure { Id = 1, WBSHeaderId = 1, TenantId = 1 };
            _context.WorkBreakdownStructures.Add(wbs);

            var header = new WBSHeader { Id = 1, ProjectId = 1, TenantId = 1 };
            _context.WBSHeaders.Add(header);

            var t = new WBSTask { Id = 1, WorkBreakdownStructureId = 1, TenantId = 1 };
            _context.WBSTasks.Add(t);

            var ph = new WBSTaskPlannedHour { Id = 1, WBSTaskId = 1, Month = "Jan", Year = DateTime.UtcNow.Year.ToString(), PlannedHours = 100, TenantId = 1 };
            _context.WBSTaskPlannedHours.Add(ph);

            var mp = new EDR.Domain.Entities.MonthlyProgress { Id = 1, ProjectId = 1, Year = DateTime.UtcNow.Year, Month = 1, TenantId = 1 };
            var fd = new FinancialDetails { Id = 1, MonthlyProgressId = 1, FeeTotal = 5000, TenantId = 1 };
            mp.FinancialDetails = fd;
            _context.MonthlyProgresses.Add(mp);

            await _context.SaveChangesAsync();

            var query = new GetMonthlyCashflowAnalysisQuery();

            // Act
            var result = await _handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.NotEmpty(result);
        }
    }
}

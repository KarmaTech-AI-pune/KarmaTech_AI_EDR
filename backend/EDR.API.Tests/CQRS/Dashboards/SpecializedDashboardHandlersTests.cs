using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;
using EDR.Domain.Database;
using EDR.Domain.Entities;
using EDR.Application.CQRS.Dashboard.TotalRevenueExpected.Handlers;
using EDR.Application.CQRS.Dashboard.TotalRevenueExpected.Queries;
using EDR.Application.CQRS.Dashboard.TotalRevenueActual.Handlers;
using EDR.Application.CQRS.Dashboard.TotalRevenueActual.Queries;
using EDR.Application.CQRS.Dashboard.TaskPriorityMatrix.Handlers;
using EDR.Application.CQRS.Dashboard.TaskPriorityMatrix.Queries;
using EDR.Application.CQRS.Dashboard.RevenueAtRisk.Handler;
using EDR.Application.CQRS.Dashboard.RevenueAtRisk.Query;
using EDR.Application.CQRS.Dashboard.Regional.Handlers;
using EDR.Application.CQRS.Dashboard.Regional.Queries;
using EDR.Application.CQRS.Dashboard.ProjectsAtRisk.Handler;
using EDR.Application.CQRS.Dashboard.ProjectsAtRisk.Query;
using EDR.Application.CQRS.Dashboard.ProfitMargin.Handler;
using EDR.Application.CQRS.Dashboard.ProfitMargin.Query;
using EDR.Application.CQRS.Dashboard.PendingApproval.Handler;
using EDR.Application.CQRS.Dashboard.PendingApproval.Query;
using EDR.Application.CQRS.Dashboard.NpvProfitability.Handlers;
using EDR.Application.CQRS.Dashboard.NpvProfitability.Queries;
using EDR.Application.CQRS.Dashboard.MonthlyProgress.Handler;
using EDR.Application.CQRS.Dashboard.MonthlyProgress.Query;
using EDR.Application.CQRS.Dashboard.MilestoneBilling.Handlers;
using EDR.Application.CQRS.Dashboard.MilestoneBilling.Queries;
using EDR.Application.CQRS.Dashboard.Cashflow.Handlers;
using EDR.Application.CQRS.Dashboard.Cashflow.Queries;

namespace EDR.API.Tests.CQRS.Dashboards
{
    public class SpecializedDashboardHandlersTests : IDisposable
    {
        private readonly ProjectManagementContext _context;

        public SpecializedDashboardHandlersTests()
        {
            var options = new DbContextOptionsBuilder<ProjectManagementContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _context = new ProjectManagementContext(options, null, null);
        }

        public void Dispose()
        {
            _context.Database.EnsureDeleted();
            _context.Dispose();
        }

        [Fact]
        public async Task GetTotalRevenueExpectedQueryHandler_ReturnsValidResult()
        {
            var loggerMock = new Mock<ILogger<GetTotalRevenueExpectedQueryHandler>>();
            var handler = new GetTotalRevenueExpectedQueryHandler(_context, loggerMock.Object);
            var result = await handler.Handle(new GetTotalRevenueExpectedQuery(), CancellationToken.None);
            Assert.NotNull(result);
        }

        [Fact]
        public async Task GetTotalRevenueActualQueryHandler_ReturnsValidResult()
        {
            var handler = new GetTotalRevenueActualQueryHandler(_context);
            var result = await handler.Handle(new GetTotalRevenueActualQuery(), CancellationToken.None);
            Assert.NotNull(result);
        }

        [Fact]
        public async Task GetTaskPriorityMatrixQueryHandler_ReturnsValidResult()
        {
            var handler = new GetTaskPriorityMatrixQueryHandler(_context);
            var result = await handler.Handle(new GetTaskPriorityMatrixQuery(), CancellationToken.None);
            Assert.NotNull(result);
        }

        [Fact]
        public async Task GetRevenueAtRiskQueryHandler_ReturnsValidResult()
        {
            var handler = new GetRevenueAtRiskQueryHandler(_context);
            var result = await handler.Handle(new GetRevenueAtRiskQuery(), CancellationToken.None);
            Assert.NotNull(result);
        }

        [Fact]
        public async Task GetRegionalPortfolioQueryHandler_ReturnsValidResult()
        {
            _context.Projects.Add(new Project { Id = 1, Name = "P1", TenantId = 1 });
            await _context.SaveChangesAsync();
            var handler = new GetRegionalPortfolioQueryHandler(_context);
            var result = await handler.Handle(new GetRegionalPortfolioQuery(), CancellationToken.None);
            Assert.NotNull(result);
        }

        [Fact]
        public async Task GetProjectsAtRiskQueryHandler_ReturnsValidResult()
        {
            var loggerMock = new Mock<ILogger<GetProjectsAtRiskQueryHandler>>();
            var handler = new GetProjectsAtRiskQueryHandler(_context, loggerMock.Object);
            var result = await handler.Handle(new GetProjectsAtRiskQuery(), CancellationToken.None);
            Assert.NotNull(result);
        }

        [Fact]
        public async Task GetProfitMarginQueryHandler_ReturnsValidResult()
        {
            var handler = new GetProfitMarginQueryHandler(_context);
            var result = await handler.Handle(new GetProfitMarginQuery(), CancellationToken.None);
            Assert.NotNull(result);
        }

        [Fact]
        public async Task GetPendingFormsHandler_ReturnsValidResult()
        {
            var handler = new GetPendingFormsHandler(_context);
            var result = await handler.Handle(new GetPendingFormsQuery(), CancellationToken.None);
            Assert.NotNull(result);
        }

        [Fact]
        public async Task GetNpvProfitabilityQueryHandler_ReturnsValidResult()
        {
            var handler = new GetNpvProfitabilityQueryHandler(_context);
            var result = await handler.Handle(new GetNpvProfitabilityQuery(), CancellationToken.None);
            Assert.NotNull(result);
        }

        [Fact]
        public async Task GetMonthlyProgressHandler_ReturnsValidResult()
        {
            var handler = new GetMonthlyProgressHandler(_context);
            var result = await handler.Handle(new GetMonthlyProgressQuery(), CancellationToken.None);
            Assert.NotNull(result);
        }

        [Fact]
        public async Task GetMilestoneBillingQueryHandler_ReturnsValidResult()
        {
            var handler = new GetMilestoneBillingQueryHandler(_context);
            var result = await handler.Handle(new GetMilestoneBillingQuery(), CancellationToken.None);
            Assert.NotNull(result);
        }

        [Fact]
        public async Task GetMonthlyCashflowAnalysisQueryHandler_ReturnsValidResult()
        {
            var handler = new GetMonthlyCashflowAnalysisQueryHandler(_context);
            var result = await handler.Handle(new GetMonthlyCashflowAnalysisQuery(), CancellationToken.None);
            Assert.NotNull(result);
        }
    }
}

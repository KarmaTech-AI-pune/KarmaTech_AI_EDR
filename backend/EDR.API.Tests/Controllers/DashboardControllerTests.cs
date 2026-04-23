using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Moq;
using Xunit;
using EDR.API.Controllers;
using EDR.Application.CQRS.Dashboard.TotalRevenueExpected.Queries;
using EDR.Application.CQRS.Dashboard.TotalRevenueActual.Queries;
using EDR.Application.CQRS.Dashboard.PendingApproval.Query;
using EDR.Application.CQRS.Dashboard.ProfitMargin.Query;
using EDR.Application.CQRS.Dashboard.RevenueAtRisk.Query;
using EDR.Application.CQRS.Dashboard.ProjectsAtRisk.Query;
using EDR.Application.Dtos.Dashboard;
using EDR.Application.CQRS.Dashboard.Cashflow.Queries;
using EDR.Application.CQRS.Dashboard.Regional.Queries;
using EDR.Application.CQRS.Dashboard.NpvProfitability.Queries;
using EDR.Application.CQRS.Dashboard.MilestoneBilling.Queries;
using EDR.Application.CQRS.Dashboard.TaskPriorityMatrix.Queries;
using EDR.Application.CQRS.Dashboard;

namespace EDR.API.Tests.Controllers
{
    public class DashboardControllerTests
    {
        private readonly Mock<IMediator> _mediatorMock;
        private readonly DashboardController _controller;

        public DashboardControllerTests()
        {
            _mediatorMock = new Mock<IMediator>();
            _controller = new DashboardController(_mediatorMock.Object);
        }

        [Fact]
        public async Task GetPendingForms_ReturnsOk()
        {
            _mediatorMock.Setup(m => m.Send(It.IsAny<GetPendingFormsQuery>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(new PendingFormsResponseDto());

            var result = await _controller.GetPendingForms();

            Assert.IsType<OkObjectResult>(result.Result);
        }

        [Fact]
        public async Task GetTotalRevenueExpected_ReturnsOk()
        {
            _mediatorMock.Setup(m => m.Send(It.IsAny<GetTotalRevenueExpectedQuery>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(new TotalRevenueExpectedDto());

            var result = await _controller.GetTotalRevenueExpected();

            Assert.IsType<OkObjectResult>(result.Result);
        }

        [Fact]
        public async Task GetTotalRevenueActual_ReturnsOk()
        {
            _mediatorMock.Setup(m => m.Send(It.IsAny<GetTotalRevenueActualQuery>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(new TotalRevenueActualDto());

            var result = await _controller.GetTotalRevenueActual();

            Assert.IsType<OkObjectResult>(result.Result);
        }

        [Fact]
        public async Task GetProfitMargin_ReturnsOk()
        {
            _mediatorMock.Setup(m => m.Send(It.IsAny<GetProfitMarginQuery>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(new ProfitMarginDto());

            var result = await _controller.GetProfitMargin();

            Assert.IsType<OkObjectResult>(result.Result);
        }

        [Fact]
        public async Task GetRevenueAtRisk_ReturnsOk()
        {
            _mediatorMock.Setup(m => m.Send(It.IsAny<GetRevenueAtRiskQuery>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(new RevenueAtRiskDto());

            var result = await _controller.GetRevenueAtRisk();

            Assert.IsType<OkObjectResult>(result.Result);
        }

        [Fact]
        public async Task GetProjectsAtRisk_ReturnsOk()
        {
            _mediatorMock.Setup(m => m.Send(It.IsAny<GetProjectsAtRiskQuery>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(new ProjectsAtRiskResponseDto());

            var result = await _controller.GetProjectsAtRisk();

            Assert.IsType<OkObjectResult>(result.Result);
        }

        [Fact]
        public async Task GetMonthlyCashflowAnalysis_ReturnsOk()
        {
            _mediatorMock.Setup(m => m.Send(It.IsAny<GetMonthlyCashflowAnalysisQuery>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(new List<MonthlyCashflowDto>());

            var result = await _controller.GetMonthlyCashflowAnalysis();

            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            Assert.NotNull(okResult.Value);
        }

        [Fact]
        public async Task GetRegionalPortfolio_ReturnsOk()
        {
            _mediatorMock.Setup(m => m.Send(It.IsAny<GetRegionalPortfolioQuery>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(new List<RegionalPortfolioDto>());

            var result = await _controller.GetRegionalPortfolio();

            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            Assert.NotNull(okResult.Value);
        }

        [Fact]
        public async Task GetNpvProfitability_ReturnsOk()
        {
            _mediatorMock.Setup(m => m.Send(It.IsAny<GetNpvProfitabilityQuery>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(new NpvProfitabilityDto());

            var result = await _controller.GetNpvProfitability();

            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            Assert.NotNull(okResult.Value);
        }

        [Fact]
        public async Task GetMilestoneBilling_ReturnsOk()
        {
            _mediatorMock.Setup(m => m.Send(It.IsAny<GetMilestoneBillingQuery>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(new List<MilestoneBillingDto>());

            var result = await _controller.GetMilestoneBilling();

            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            Assert.NotNull(okResult.Value);
        }

        [Fact]
        public async Task GetTaskPriorityMatrix_ReturnsOk()
        {
            _mediatorMock.Setup(m => m.Send(It.IsAny<GetTaskPriorityMatrixQuery>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(new List<TaskPriorityItemDto>());

            var result = await _controller.GetTaskPriorityMatrix();

            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            Assert.NotNull(okResult.Value);
        }

        [Fact]
        public async Task GetProjectDashboard_ReturnsOk_WhenFound()
        {
            _mediatorMock.Setup(m => m.Send(It.IsAny<GetProjectDashboardQuery>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(new ProjectDashboardDto());

            var result = await _controller.GetProjectDashboard(1);

            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            Assert.NotNull(okResult.Value);
        }

        [Fact]
        public async Task GetProjectDashboard_ReturnsNotFound_WhenNull()
        {
            _mediatorMock.Setup(m => m.Send(It.IsAny<GetProjectDashboardQuery>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync((ProjectDashboardDto)null);

            var result = await _controller.GetProjectDashboard(1);

            var notFoundResult = Assert.IsType<NotFoundObjectResult>(result.Result);
            Assert.NotNull(notFoundResult.Value);
        }
        
        [Fact]
        public async Task GetProgramDashboard_ReturnsOk_WhenFound()
        {
            _mediatorMock.Setup(m => m.Send(It.IsAny<GetProgramDashboardQuery>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(new ProgramDashboardDto());

            var result = await _controller.GetProgramDashboard(1);

            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            Assert.NotNull(okResult.Value);
        }

        [Fact]
        public async Task GetProgramDashboard_ReturnsNotFound_WhenNull()
        {
            _mediatorMock.Setup(m => m.Send(It.IsAny<GetProgramDashboardQuery>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync((ProgramDashboardDto)null);

            var result = await _controller.GetProgramDashboard(1);

            var notFoundResult = Assert.IsType<NotFoundObjectResult>(result.Result);
            Assert.NotNull(notFoundResult.Value);
        }

        [Fact]
        public async Task GetProgramDashboard_Returns500_OnException()
        {
            _mediatorMock.Setup(m => m.Send(It.IsAny<GetProgramDashboardQuery>(), It.IsAny<CancellationToken>()))
                .ThrowsAsync(new Exception("DB Error"));

            var result = await _controller.GetProgramDashboard(1);

            var statusCodeResult = Assert.IsType<ObjectResult>(result.Result);
            Assert.Equal(500, statusCodeResult.StatusCode);
        }
    }
}

using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using EDR.Application.CQRS.Dashboard.Dashboard.Queries;
using EDR.Application.Dtos.Dashboard;
using EDR.Application.CQRS.Dashboard;
using System.Threading.Tasks;
using System.Collections.Generic;
using Microsoft.AspNetCore.Http;
using System;

namespace EDR.API.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class DashboardController : ControllerBase
    {
        private readonly IMediator _mediator;

        public DashboardController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet("pending-forms")]
        public async Task<ActionResult<PendingFormsResponseDto>> GetPendingForms()
        {
            var query = new GetPendingFormsQuery();
            var pendingForms = await _mediator.Send(query);

            return Ok(pendingForms);
        }

        [HttpGet("total-revenue-expected")]
        public async Task<ActionResult<TotalRevenueExpectedDto>> GetTotalRevenueExpected()
        {
            var query = new GetTotalRevenueExpectedQuery();
            var totalRevenueExpected = await _mediator.Send(query);

            return Ok(totalRevenueExpected);
        }

        [HttpGet("total-revenue-actual")]
        public async Task<ActionResult<TotalRevenueActualDto>> GetTotalRevenueActual()
        {
            var query = new GetTotalRevenueActualQuery();
            var totalRevenueActual = await _mediator.Send(query);

            return Ok(totalRevenueActual);
        }

        [HttpGet("profit-margin")]
        public async Task<ActionResult<ProfitMarginDto>> GetProfitMargin()
        {
            var query = new GetProfitMarginQuery();
            var profitMargin = await _mediator.Send(query);
            return Ok(profitMargin);
        }

        [HttpGet("revenue-at-risk")]
        public async Task<ActionResult<RevenueAtRiskDto>> GetRevenueAtRisk()
        {
            var query = new GetRevenueAtRiskQuery();
            var revenueAtRisk = await _mediator.Send(query);
            return Ok(revenueAtRisk);
        }

        [HttpGet("projects-at-risk")]
        public async Task<ActionResult<ProjectsAtRiskResponseDto>> GetProjectsAtRisk()
        {
            var query = new GetProjectsAtRiskQuery();
            var projectsAtRisk = await _mediator.Send(query);
            return Ok(projectsAtRisk);
        }

        [HttpGet("monthly-cashflow")]
        [ProducesResponseType(typeof(List<MonthlyCashflowDto>), StatusCodes.Status200OK)]
        public async Task<ActionResult<List<MonthlyCashflowDto>>> GetMonthlyCashflowAnalysis()
        {
            var query = new GetMonthlyCashflowAnalysisQuery();
            var result = await _mediator.Send(query);
            return Ok(result);
        }

        [HttpGet("regional-portfolio")]
        [ProducesResponseType(typeof(List<RegionalPortfolioDto>), StatusCodes.Status200OK)]
        public async Task<ActionResult<List<RegionalPortfolioDto>>> GetRegionalPortfolio()
        {
            var query = new GetRegionalPortfolioQuery();
            var result = await _mediator.Send(query);
            return Ok(result);
        }

        [HttpGet("npv-profitability")]
        [ProducesResponseType(typeof(NpvProfitabilityDto), StatusCodes.Status200OK)]
        public async Task<ActionResult<NpvProfitabilityDto>> GetNpvProfitability()
        {
            var query = new GetNpvProfitabilityQuery();
            var result = await _mediator.Send(query);
            return Ok(result);
        }

        [HttpGet("milestone-billing")]
        [ProducesResponseType(typeof(List<MilestoneBillingDto>), StatusCodes.Status200OK)]
        public async Task<ActionResult<List<MilestoneBillingDto>>> GetMilestoneBilling()
        {
            var query = new GetMilestoneBillingQuery();
            var result = await _mediator.Send(query);
            return Ok(result);
        }

        [HttpGet("task-priority-matrix")]
        [ProducesResponseType(typeof(List<TaskPriorityItemDto>), StatusCodes.Status200OK)]
        public async Task<ActionResult<List<TaskPriorityItemDto>>> GetTaskPriorityMatrix()
        {
            var query = new GetTaskPriorityMatrixQuery();
            var result = await _mediator.Send(query);
            return Ok(result);
        }
    }
}


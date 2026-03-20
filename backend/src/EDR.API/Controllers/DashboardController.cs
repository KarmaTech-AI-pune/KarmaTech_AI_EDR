using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
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
using EDR.Application.CQRS.Dashboard;
using System.Threading.Tasks;

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
        public async Task<ActionResult<TotalRevenueExpectedDto>> GetTotalRevenueExpected() // Reverted DTO name
        {
            var query = new GetTotalRevenueExpectedQuery();
            var totalRevenueExpected = await _mediator.Send(query);

            return Ok(totalRevenueExpected);
        }

        [HttpGet("total-revenue-actual")]
        public async Task<ActionResult<TotalRevenueActualDto>> GetTotalRevenueActual() // Reverted DTO name
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

        [HttpGet("project/{projectId}")]
        [ProducesResponseType(typeof(ProjectDashboardDto), StatusCodes.Status200OK)]
        public async Task<ActionResult<ProjectDashboardDto>> GetProjectDashboard(int projectId)
        {
            var query = new GetProjectDashboardQuery { ProjectId = projectId };
            var result = await _mediator.Send(query);

            if (result == null)
            {
                return NotFound(new { message = $"Project with ID {projectId} not found." });
            }

            return Ok(result);
        }

        [HttpGet("program/{programId}")]
        [ProducesResponseType(typeof(ProgramDashboardDto), StatusCodes.Status200OK)]
        public async Task<ActionResult<ProgramDashboardDto>> GetProgramDashboard(int programId)
        {
            try
            {
                Console.WriteLine($"[DashboardController] Received request for program dashboard. ProgramId: {programId}");
                
                var query = new GetProgramDashboardQuery { ProgramId = programId };
                var result = await _mediator.Send(query);

                if (result == null)
                {
                    Console.WriteLine($"[DashboardController] Program dashboard result is null for ProgramId: {programId}");
                    return NotFound(new { message = $"Program with ID {programId} not found." });
                }

                Console.WriteLine($"[DashboardController] Returning success for program dashboard. ProgramId: {programId}");
                return Ok(result);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[DashboardController] Exception in GetProgramDashboard: {ex.Message}");
                Console.WriteLine(ex.StackTrace);
                return StatusCode(500, new { message = ex.Message, detail = ex.ToString() });
            }
        }
    }
}


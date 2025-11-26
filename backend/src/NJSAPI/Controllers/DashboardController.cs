using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NJS.Application.CQRS.Dashboard.TotalRevenueExpected.Queries;
using NJS.Application.CQRS.Dashboard.TotalRevenueActual.Queries;
using NJS.Application.CQRS.Dashboard.PendingApproval.Query;
using NJS.Application.CQRS.Dashboard.ProfitMargin.Query;
using NJS.Application.CQRS.Dashboard.RevenueAtRisk.Query;
using NJS.Application.CQRS.Dashboard.ProjectsAtRisk.Query;
using NJS.Application.DTOs.Dashboard; // Corrected DTO namespace
using NJS.Application.Dtos.Dashboard; // Added for compatibility with other DTOs
using System.Threading.Tasks;

namespace NJSAPI.Controllers
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
    }
}

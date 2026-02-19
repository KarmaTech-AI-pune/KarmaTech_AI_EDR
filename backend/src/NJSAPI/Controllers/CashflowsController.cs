using MediatR;
using Microsoft.AspNetCore.Mvc;
using NJS.Application.DTOs;
using System.Collections.Generic;
using System.Threading.Tasks;
using NJS.Application.CQRS.Cashflow;
using NJS.Application.CQRS.Cashflow.Queries;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Logging;
using System;
using System.Linq;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Authorization;

namespace NJSAPI.Controllers
{
    [Route("api/projects/{projectId}/cashflows")]
    [ApiController]
   // [Authorize]
    public class CashflowsController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly ILogger<CashflowsController> _logger;

        public CashflowsController(IMediator mediator, ILogger<CashflowsController> logger)
        {
            _mediator = mediator ?? throw new ArgumentNullException(nameof(mediator));
            _logger = logger;
        }

        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult> GetAllCashflows(int projectId)
        {
            try
            {
                var query = new GetAllCashflowsQuery { ProjectId = projectId };
                var cashflows = await _mediator.Send(query);
                
                // Transform to frontend expected format (camelCase)
                var response = new
                {
                    projectId = projectId.ToString(),
                    rows = cashflows.Select(c => new
                    {
                        period = c.Month,
                        hours = c.Hours ?? 0,
                        personnel = c.PersonnelCost ?? 0,
                        odc = c.OdcCost ?? 0,
                        totalCosts = c.TotalProjectCost ?? 0,
                        revenue = c.Revenue ?? 0,
                        netCashFlow = c.CashFlow ?? 0,
                        status = c.Status
                    }).ToList()
                };
                
                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while retrieving all cashflows for project {projectId}.", projectId);
                return StatusCode(500, new { message = $"An error occurred while retrieving cashflows for project {projectId}.", error = ex.Message });
            }
        }


        [HttpGet("cumulative")]
        public async Task<ActionResult<List<CumulativeCashflowDto>>> GetCumulativeCashflows(int projectId)
        {
            var query = new GetCumulativeCashflowsQuery(projectId);
            var result = await _mediator.Send(query);
            return Ok(result);
        }

        [HttpGet("financial-summary")]
        public async Task<ActionResult<FinancialSummaryDto>> GetFinancialSummary(int projectId)
        {
            var query = new GetFinancialSummaryQuery(projectId);
            var result = await _mediator.Send(query);
            return Ok(result);
        }

        [HttpGet("payment-milestones")]
        public async Task<ActionResult<List<PaymentMilestoneDto>>> GetPaymentMilestones(int projectId)
        {
            var query = new GetPaymentMilestonesQuery(projectId);
            var result = await _mediator.Send(query);
            return Ok(result);
        }
    }
}

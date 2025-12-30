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
        [ProducesResponseType(typeof(IEnumerable<CashflowDto>), StatusCodes.Status200OK)]
        public async Task<ActionResult<List<CashflowDto>>> GetAllCashflows(int projectId)
        {
            try
            {
                var query = new GetAllCashflowsQuery { ProjectId = projectId };
                var cashflows = await _mediator.Send(query);
                return Ok(cashflows);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while retrieving all cashflows for project {projectId}.", projectId);
                return StatusCode(500, new { message = $"An error occurred while retrieving cashflows for project {projectId}.", error = ex.Message });
            }
        }

        [HttpGet("{id}")]
        [ProducesResponseType(typeof(CashflowDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<CashflowDto>> GetCashflow(int id)
        {
            try
            {
                var query = new GetCashflowQuery { Id = id };
                var cashflow = await _mediator.Send(query);

                if (cashflow == null)
                {
                    return NotFound($"Cashflow with ID {id} not found.");
                }

                return Ok(cashflow);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while retrieving cashflow {id}.", id);
                return StatusCode(500, new { message = $"An error occurred while retrieving cashflow {id}.", error = ex.Message });
            }
        }
    }
}

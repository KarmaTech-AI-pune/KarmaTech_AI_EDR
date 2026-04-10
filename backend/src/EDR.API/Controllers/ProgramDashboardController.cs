using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using EDR.Application.CQRS.Dashboard.ProgramDashboard.Queries;
using EDR.Application.Dtos.ProgramDashboard;
using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;

namespace EDR.API.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]

    public class ProgramDashboardController : ControllerBase
    {
        private readonly IMediator _mediator;

        public ProgramDashboardController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet("program/{programId}")]
        [ProducesResponseType(typeof(ProgramDashboardDto), StatusCodes.Status200OK)]
        public async Task<ActionResult<ProgramDashboardDto>> GetProgramDashboard(int programId)
        {
            try
            {
                var query = new GetProgramDashboardQuery { ProgramId = programId };
                var result = await _mediator.Send(query);

                if (result == null)
                {
                    return NotFound(new { message = $"Program with ID {programId} not found." });
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message, detail = ex.ToString() });
            }
        }
    }
}

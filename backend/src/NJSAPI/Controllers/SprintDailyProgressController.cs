using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NJS.Application.CQRS.SprintDailyProgresses.Commands;
using NJS.Application.CQRS.SprintDailyProgresses.Queries; // Added for GetSprintDailyProgressBySprintPlanIdQuery
using NJS.Application.Dtos;
using System.Collections.Generic; // Added for IEnumerable
using System.Threading.Tasks;

namespace NJS.API.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class SprintDailyProgressController : ControllerBase
    {
        private readonly IMediator _mediator;

        public SprintDailyProgressController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpPost]
        public async Task<ActionResult<SprintDailyProgressDto>> CreateSprintDailyProgress([FromBody] CreateSprintDailyProgressCommand command)
        {
            try
            {
                var sprintDailyProgressDto = await _mediator.Send(command);
                return CreatedAtAction(nameof(CreateSprintDailyProgress), new { id = sprintDailyProgressDto.DailyProgressId }, sprintDailyProgressDto);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                // Log the exception (e.g., using a logger)
                return StatusCode(500, "An error occurred while creating the sprint daily progress: " + ex.Message);
            }
        }

        [HttpPut("{dailyProgressId}")]
        public async Task<ActionResult<SprintDailyProgressDto>> UpdateSprintDailyProgress(int dailyProgressId, [FromBody] UpdateSprintDailyProgressCommand command)
        {
            if (dailyProgressId != command.DailyProgressId)
            {
                return BadRequest("DailyProgressId in URL and body do not match.");
            }

            try
            {
                var sprintDailyProgressDto = await _mediator.Send(command);
                return Ok(sprintDailyProgressDto);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                // Log the exception
                return StatusCode(500, "An error occurred while updating the sprint daily progress: " + ex.Message);
            }
        }

        [HttpGet("BySprintPlan/{sprintPlanId}")]
        public async Task<ActionResult<IEnumerable<SprintDailyProgressDto>>> GetSprintDailyProgressBySprintPlanId(int sprintPlanId)
        {
            try
            {
                var query = new GetSprintDailyProgressBySprintPlanIdQuery { SprintPlanId = sprintPlanId };
                var sprintDailyProgresses = await _mediator.Send(query);
                return Ok(sprintDailyProgresses);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                // Log the exception
                return StatusCode(500, "An error occurred while retrieving sprint daily progress: " + ex.Message);
            }
        }
    }
}

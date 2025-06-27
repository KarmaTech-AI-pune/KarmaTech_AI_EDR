using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using NJS.Application.CQRS.MonthlyProgress.Commands;
using NJS.Application.CQRS.MonthlyProgress.Queries;
using NJS.Application.DTOs;
using Microsoft.AspNetCore.Authorization;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace NJSAPI.Controllers
{
    [Route("api/projects/{projectId}/monthlyprogress")]
    [ApiController]
    [Authorize]
    public class MonthlyProgressController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly ILogger<MonthlyProgressController> _logger; // Added ILogger

        public MonthlyProgressController(IMediator mediator, ILogger<MonthlyProgressController> logger) // Added ILogger to constructor
        {
            _mediator = mediator ?? throw new ArgumentNullException(nameof(mediator));
            _logger = logger; // Assign logger
        }

        // GET: api/projects/{projectId}/monthlyprogress
        [HttpGet]
        [AllowAnonymous]
        [ProducesResponseType(typeof(IEnumerable<MonthlyProgressDto>), StatusCodes.Status200OK)]
        public async Task<ActionResult<IEnumerable<MonthlyProgressDto>>> GetAllMonthlyProgressByProject(int projectId)
        {
            try
            {
                var query = new GetMonthlyProgressByProjectIdQuery { ProjectId = projectId };
                var result = await _mediator.Send(query);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting monthly progress for project {ProjectId}", projectId);
                return StatusCode(500, new { message = "An error occurred while retrieving monthly progress.", error = ex.Message });
            }
        }

        // GET: api/projects/{projectId}/monthlyprogress/{id}
        [HttpGet("{id}")]
        [AllowAnonymous]
        [ProducesResponseType(typeof(MonthlyProgressDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<MonthlyProgressDto>> GetMonthlyProgressById(int projectId, int id)
        {
            try
            {
                var query = new GetMonthlyProgressByIdQuery { Id = id };
                var result = await _mediator.Send(query);
                if (result == null)
                {
                    return NotFound();
                }
                // Optional: Check if result.ProjectId matches projectId from route
                if (result.ProjectId != projectId)
                {
                    return Forbid(); // Or NotFound() depending on desired behavior
                }
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting monthly progress {Id} for project {ProjectId}", id, projectId);
                return StatusCode(500, new { message = "An error occurred while retrieving monthly progress.", error = ex.Message });
            }
        }

        // POST: api/projects/{projectId}/monthlyprogress
        [HttpPost]
        [AllowAnonymous]
        [ProducesResponseType(typeof(MonthlyProgressDto), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<MonthlyProgressDto>> CreateMonthlyProgress(int projectId, [FromBody] CreateMonthlyProgressDto createDto)
        {
            if (createDto == null)
            {
                return BadRequest("Monthly Progress data is required.");
            }

            try
            {
                var command = new CreateMonthlyProgressCommand { ProjectId = projectId, MonthlyProgress = createDto };
                var newId = await _mediator.Send(command);

                // Fetch the created entity to return it
                var query = new GetMonthlyProgressByIdQuery { Id = newId };
                var createdDto = await _mediator.Send(query);

                return CreatedAtAction(nameof(GetMonthlyProgressById), new { projectId = projectId, id = newId }, createdDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating monthly progress for project {ProjectId}", projectId);
                return StatusCode(500, new { message = "An error occurred while creating monthly progress.", error = ex.Message });
            }
        }

        // PUT: api/projects/{projectId}/monthlyprogress/{id}
        [HttpPut("{id}")]
        [AllowAnonymous]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateMonthlyProgress(int projectId, int id, [FromBody] CreateMonthlyProgressDto updateDto)
        {
            if (updateDto == null)
            {
                return BadRequest("Invalid request data.");
            }

            try
            {
                // Check if the entity exists before sending the update command
                var checkQuery = new GetMonthlyProgressByIdQuery { Id = id };
                var existing = await _mediator.Send(checkQuery);
                if (existing == null || existing.ProjectId != projectId)
                {
                    return NotFound();
                }

                var command = new UpdateMonthlyProgressCommand { Id = id, MonthlyProgress = updateDto };
                await _mediator.Send(command);

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating monthly progress {Id} for project {ProjectId}", id, projectId);
                return StatusCode(500, new { message = "An error occurred while updating monthly progress.", error = ex.Message });
            }
        }

        // DELETE: api/projects/{projectId}/monthlyprogress/{id}
        [HttpDelete("{id}")]
        [AllowAnonymous]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeleteMonthlyProgress(int projectId, int id)
        {
            try
            {
                // Optional: Check if the entity exists and belongs to the project before sending the delete command
                var checkQuery = new GetMonthlyProgressByIdQuery { Id = id };
                var existing = await _mediator.Send(checkQuery);
                if (existing == null || existing.ProjectId != projectId)
                {
                    return NotFound(); // Or Forbid()
                }

                var command = new DeleteMonthlyProgressCommand { Id = id };
                await _mediator.Send(command);

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting monthly progress with ID: {Id} for project {ProjectId}", id, projectId);
                return StatusCode(500, new { message = "An error occurred while deleting monthly progress.", error = ex.Message });
            }
        }
    }
}

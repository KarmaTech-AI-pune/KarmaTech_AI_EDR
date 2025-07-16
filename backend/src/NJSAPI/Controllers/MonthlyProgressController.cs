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

        // GET: api/projects/{projectId}/year/{year}/month/{month}
        [HttpGet("year/{year}/month/{month}")]
        [AllowAnonymous]
        [ProducesResponseType(typeof(MonthlyProgressDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<MonthlyProgressDto>> GetMonthlyProgressByYearMonth(int projectId, int year, int month)
        {
            try
            {
                var query = new GetMonthlyProgressByProjectYearMonthQuery { ProjectId = projectId, Year = year, Month = month };
                var result = await _mediator.Send(query);
                if (result == null)
                {
                    return NotFound();
                }
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting monthly progress for project {ProjectId}, year {Year}, month {Month}", projectId, year, month);
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

                // Fetch the created entity to return it using year/month
                var query = new GetMonthlyProgressByProjectYearMonthQuery {
                    ProjectId = projectId,
                    Year = createDto.Year,
                    Month = createDto.Month
                };
                var createdDto = await _mediator.Send(query);

                return CreatedAtAction(nameof(GetMonthlyProgressByYearMonth),
                    new { projectId = projectId, year = createDto.Year, month = createDto.Month }, createdDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating monthly progress for project {ProjectId}", projectId);
                return StatusCode(500, new { message = "An error occurred while creating monthly progress.", error = ex.Message });
            }
        }

        // PUT: api/projects/{projectId}/year/{year}/month/{month}
        [HttpPut("year/{year}/month/{month}")]
        [AllowAnonymous]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateMonthlyProgressByYearMonth(int projectId, int year, int month, [FromBody] CreateMonthlyProgressDto updateDto)
        {
            if (updateDto == null)
            {
                return BadRequest("Invalid request data.");
            }

            try
            {
                // Check if the entity exists before sending the update command
                var checkQuery = new GetMonthlyProgressByProjectYearMonthQuery { ProjectId = projectId, Year = year, Month = month };
                var existing = await _mediator.Send(checkQuery);
                if (existing == null)
                {
                    return NotFound();
                }

                var command = new UpdateMonthlyProgressCommand { Id = existing.Id, MonthlyProgress = updateDto };
                await _mediator.Send(command);

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating monthly progress for project {ProjectId}, year {Year}, month {Month}", projectId, year, month);
                return StatusCode(500, new { message = "An error occurred while updating monthly progress.", error = ex.Message });
            }
        }

        // DELETE: api/projects/{projectId}/year/{year}/month/{month}
        [HttpDelete("year/{year}/month/{month}")]
        [AllowAnonymous]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeleteMonthlyProgressByYearMonth(int projectId, int year, int month)
        {
            try
            {
                // Check if the entity exists before sending the delete command
                var checkQuery = new GetMonthlyProgressByProjectYearMonthQuery { ProjectId = projectId, Year = year, Month = month };
                var existing = await _mediator.Send(checkQuery);
                if (existing == null)
                {
                    return NotFound();
                }

                var command = new DeleteMonthlyProgressCommand { Id = existing.Id };
                await _mediator.Send(command);

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting monthly progress for project {ProjectId}, year {Year}, month {Month}", projectId, year, month);
                return StatusCode(500, new { message = "An error occurred while deleting monthly progress.", error = ex.Message });
            }
        }
    }
}

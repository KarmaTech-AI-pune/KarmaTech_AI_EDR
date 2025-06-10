using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging; // Corrected for ILogger
using NJS.Application.CQRS.MonthlyProgress.Commands;
using NJS.Application.CQRS.MonthlyProgress.Queries;
using NJS.Application.DTOs;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace NJSAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MonthlyProgressController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly ILogger<MonthlyProgressController> _logger; // Added ILogger

        public MonthlyProgressController(IMediator mediator, ILogger<MonthlyProgressController> logger) // Added ILogger to constructor
        {
            _mediator = mediator ?? throw new ArgumentNullException(nameof(mediator));
            _logger = logger; // Assign logger
        }

        /// <summary>
        /// Creates a new Monthly Progress record.
        /// </summary>
        /// <param name="monthlyProgressDto">The Monthly Progress data.</param>
        /// <returns>A newly created Monthly Progress record ID.</returns>
        [HttpPost]
        [ProducesResponseType(typeof(int), 201)] // Created
        [ProducesResponseType(typeof(string), 400)] // Bad Request
        [ProducesResponseType(typeof(string), 500)] // Internal Server Error
        public async Task<IActionResult> CreateMonthlyProgress([FromBody] MonthlyProgressDto monthlyProgressDto)
        {
            if (monthlyProgressDto == null)
            {
                _logger.LogWarning("CreateMonthlyProgress: MonthlyProgress data is null.");
                return BadRequest("MonthlyProgress data is null.");
            }

            try
            {
                var command = new CreateMonthlyProgressCommand { MonthlyProgress = monthlyProgressDto };
                var id = await _mediator.Send(command);
                _logger.LogInformation($"CreateMonthlyProgress: Successfully created MonthlyProgress with ID: {id}");
                return CreatedAtAction(nameof(GetMonthlyProgressById), new { id = id }, id); // Return ID instead of DTO for CreatedAtAction
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "CreateMonthlyProgress: Error creating MonthlyProgress.");
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        /// <summary>
        /// Gets a Monthly Progress record by ID.
        /// </summary>
        /// <param name="id">The ID of the Monthly Progress record.</param>
        /// <returns>The Monthly Progress record.</returns>
        [HttpGet("{id}")]
        [ProducesResponseType(typeof(MonthlyProgressDto), 200)] // OK
        [ProducesResponseType(typeof(string), 404)] // Not Found
        [ProducesResponseType(typeof(string), 500)] // Internal Server Error
        public async Task<IActionResult> GetMonthlyProgressById(int id)
        {
            try
            {
                var query = new GetMonthlyProgressByIdQuery { Id = id };
                var monthlyProgress = await _mediator.Send(query);

                if (monthlyProgress == null)
                {
                    _logger.LogWarning($"GetMonthlyProgressById: MonthlyProgress with ID {id} not found.");
                    return NotFound($"MonthlyProgress with ID {id} not found.");
                }
                _logger.LogInformation($"GetMonthlyProgressById: Successfully retrieved MonthlyProgress with ID: {id}");
                return Ok(monthlyProgress);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"GetMonthlyProgressById: Error retrieving MonthlyProgress with ID: {id}.");
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        /// <summary>
        /// Gets all Monthly Progress records.
        /// </summary>
        /// <returns>A list of Monthly Progress records.</returns>
        [HttpGet]
        [ProducesResponseType(typeof(List<MonthlyProgressDto>), 200)] // OK
        [ProducesResponseType(typeof(string), 500)] // Internal Server Error
        public async Task<IActionResult> GetAllMonthlyProgress()
        {
            try
            {
                var query = new GetAllMonthlyProgressQuery();
                var monthlyProgresses = await _mediator.Send(query);
                _logger.LogInformation("GetAllMonthlyProgress: Successfully retrieved all Monthly Progress records.");
                return Ok(monthlyProgresses);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "GetAllMonthlyProgress: Error retrieving all Monthly Progress records.");
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        /// <summary>
        /// Updates an existing Monthly Progress record.
        /// </summary>
        /// <param name="id">The ID of the Monthly Progress record to update.</param>
        /// <param name="monthlyProgressDto">The updated Monthly Progress data.</param>
        /// <returns>The updated Monthly Progress record.</returns>
        [HttpPut("{id}")]
        [ProducesResponseType(typeof(MonthlyProgressDto), 200)] // OK
        [ProducesResponseType(typeof(string), 400)] // Bad Request
        [ProducesResponseType(typeof(string), 404)] // Not Found
        [ProducesResponseType(typeof(string), 500)] // Internal Server Error
        public async Task<IActionResult> UpdateMonthlyProgress(int id, [FromBody] MonthlyProgressDto monthlyProgressDto)
        {
            if (monthlyProgressDto == null)
            {
                _logger.LogWarning($"UpdateMonthlyProgress: MonthlyProgress data is null for ID: {id}.");
                return BadRequest("MonthlyProgress data is null.");
            }

            try
            {
                var command = new UpdateMonthlyProgressCommand { Id = id, MonthlyProgress = monthlyProgressDto };
                var result = await _mediator.Send(command);

                if (!result)
                {
                    _logger.LogWarning($"UpdateMonthlyProgress: MonthlyProgress with ID {id} not found for update.");
                    return NotFound($"MonthlyProgress with ID {id} not found.");
                }

                // Fetch the updated record to return it
                var updatedMonthlyProgress = await _mediator.Send(new GetMonthlyProgressByIdQuery { Id = id });
                _logger.LogInformation($"UpdateMonthlyProgress: Successfully updated MonthlyProgress with ID: {id}");
                return Ok(updatedMonthlyProgress);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"UpdateMonthlyProgress: Error updating MonthlyProgress with ID: {id}.");
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        /// <summary>
        /// Deletes a Monthly Progress record by ID.
        /// </summary>
        /// <param name="id">The ID of the Monthly Progress record to delete.</param>
        /// <returns>No content if successful.</returns>
        [HttpDelete("{id}")]
        [ProducesResponseType(204)] // No Content
        [ProducesResponseType(typeof(string), 404)] // Not Found
        [ProducesResponseType(typeof(string), 500)] // Internal Server Error
        public async Task<IActionResult> DeleteMonthlyProgress(int id)
        {
            try
            {
                var command = new DeleteMonthlyProgressCommand { Id = id };
                var result = await _mediator.Send(command);

                if (!result)
                {
                    _logger.LogWarning($"DeleteMonthlyProgress: MonthlyProgress with ID {id} not found for deletion.");
                    return NotFound($"MonthlyProgress with ID {id} not found.");
                }
                _logger.LogInformation($"DeleteMonthlyProgress: Successfully deleted MonthlyProgress with ID: {id}");
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"DeleteMonthlyProgress: Error deleting MonthlyProgress with ID: {id}.");
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}

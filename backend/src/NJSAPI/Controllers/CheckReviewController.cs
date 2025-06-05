using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NJS.Application.CQRS.CheckReview.Commands;
using NJS.Application.CQRS.CheckReview.Queries;
using NJS.Application.DTOs;
using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using NJS.Application.Services.IContract; // Add this line

namespace NJSAPI.Controllers
{
    [ApiController]
    [Route("api/checkreview")]
    public class CheckReviewController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly ICurrentUserService _currentUserService; // Inject ICurrentUserService

        public CheckReviewController(IMediator mediator, ICurrentUserService currentUserService) // Update constructor
        {
            _mediator = mediator;
            _currentUserService = currentUserService; // Assign
        }

        [HttpGet]
        [AllowAnonymous] // Allow anonymous access for testing
        public async Task<ActionResult<IEnumerable<CheckReviewDto>>> GetAll()
        {
            try
            {
                // For now, we don't have a GetAll query, so we'll return an empty list
                return Ok(new List<CheckReviewDto>());
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("{id}")]
        [AllowAnonymous] // Allow anonymous access for testing
        public async Task<ActionResult<CheckReviewDto>> GetById(int id)
        {
            try
            {
                var query = new GetCheckReviewByIdQuery { Id = id };
                var result = await _mediator.Send(query);

                if (result == null)
                {
                    return NotFound($"CheckReview with ID {id} not found");
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("project/{projectId}")]
        [AllowAnonymous] // Allow anonymous access for testing
        public async Task<ActionResult<IEnumerable<CheckReviewDto>>> GetByProject(int projectId)
        {
            try
            {
                var query = new GetCheckReviewsByProjectQuery { ProjectId = projectId };
                var result = await _mediator.Send(query);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost]
        [AllowAnonymous] // Allow anonymous access for testing
        public async Task<ActionResult<CheckReviewDto>> Create([FromBody] CreateCheckReviewCommand command)
        {
            try
            {
                if (command == null)
                {
                    return BadRequest("CheckReview data is null.");
                }

                // Use the new service to get the current user's name
                command.CreatedBy = _currentUserService.IsAuthenticated ?
                    _currentUserService.UserName ?? "System" :
                    "System";

                var result = await _mediator.Send(command);
                return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPut("{id}")]
        [AllowAnonymous] // Allow anonymous access for testing
        public async Task<ActionResult<CheckReviewDto>> Update(int id, [FromBody] UpdateCheckReviewCommand command)
        {
            try
            {
                if (command == null)
                {
                    return BadRequest("CheckReview data is null.");
                }

                if (id != command.Id)
                {
                    return BadRequest("Mismatched CheckReview ID.");
                }

                // Use the new service to get the current user's name for UpdatedBy
                command.UpdatedBy = _currentUserService.IsAuthenticated ?
                    _currentUserService.UserName ?? "System" :
                    "System";

                var result = await _mediator.Send(command);
                return Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpDelete("{id}")]
        [AllowAnonymous] // Allow anonymous access for testing
        public async Task<ActionResult> Delete(int id)
        {
            try
            {
                var command = new DeleteCheckReviewCommand { Id = id };
                var result = await _mediator.Send(command);

                if (!result)
                {
                    return NotFound($"CheckReview with ID {id} not found");
                }

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}

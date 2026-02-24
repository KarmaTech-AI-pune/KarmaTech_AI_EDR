using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using EDR.Application.CQRS.Correspondence.Commands;
using EDR.Application.CQRS.Correspondence.Queries;
using EDR.Application.DTOs;
using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using EDR.Application.Services.IContract;
using EDR.Repositories.Interfaces;

namespace EDR.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class CorrespondenceController(
        IMediator mediator,
        ILogger<CorrespondenceController> logger,
        ITenantService tenantService,
        ICurrentUserService currentUserService)
        : BaseController(tenantService,
            currentUserService)
    {
        private readonly IMediator _mediator = mediator ?? throw new ArgumentNullException(nameof(mediator));
        private readonly ILogger<CorrespondenceController> _logger = logger ?? throw new ArgumentNullException(nameof(logger));

        #region Inward Correspondence

        [HttpGet("inward")]
        [AllowAnonymous] // Allow anonymous access for testing
        public async Task<ActionResult<IEnumerable<CorrespondenceInwardDto>>> GetAllInward()
        {
            try
            {
                var query = new GetAllCorrespondenceInwardsQuery();
                var result = await _mediator.Send(query);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all inward correspondence");
                return StatusCode(500,
                    new { message = "An error occurred while retrieving inward correspondence.", error = ex.Message });
            }
        }

        [HttpGet("inward/{id}")]
        [AllowAnonymous] // Allow anonymous access for testing
        public async Task<ActionResult<CorrespondenceInwardDto>> GetInwardById(int id)
        {
            try
            {
                var query = new GetCorrespondenceInwardByIdQuery { Id = id };
                var result = await _mediator.Send(query);

                if (result == null)
                {
                    return NotFound($"Inward correspondence with ID {id} not found.");
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting inward correspondence with ID {Id}", id);
                return StatusCode(500,
                    new
                    {
                        message = $"An error occurred while retrieving inward correspondence with ID {id}.",
                        error = ex.Message
                    });
            }
        }

        [HttpGet("inward/project/{projectId}")]
        [AllowAnonymous] // Allow anonymous access for testing
        public async Task<ActionResult<IEnumerable<CorrespondenceInwardDto>>> GetInwardByProject(int projectId)
        {
            try
            {
                var query = new GetCorrespondenceInwardsByProjectQuery { ProjectId = projectId };
                var result = await _mediator.Send(query);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting inward correspondence for project {ProjectId}", projectId);
                return StatusCode(500,
                    new
                    {
                        message = $"An error occurred while retrieving inward correspondence for project {projectId}.",
                        error = ex.Message
                    });
            }
        }

        [HttpPost("inward")]
        public async Task<ActionResult<CorrespondenceInwardDto>> CreateInward(
            [FromBody] CreateCorrespondenceInwardCommand command)
        {
            try
            {
                if (command == null)
                {
                    return BadRequest("Inward correspondence data is null.");
                }

                // Get the username from the authenticated user or use "System" as fallback
                command.CreatedBy = User.Identity?.IsAuthenticated == true
                    ? User.FindFirstValue(ClaimTypes.Name) ?? "System"
                    : "System";

                try
                {
                    var result = await _mediator.Send(command);
                    return CreatedAtAction(nameof(GetInwardById), new { id = result.Id }, result);
                }
                catch (InvalidOperationException ex) when (ex.Message.Contains("already exists for project ID"))
                {
                    // An entry already exists for this project
                    return BadRequest(new { message = ex.Message });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating inward correspondence");
                return StatusCode(500,
                    new { message = "An error occurred while creating inward correspondence.", error = ex.Message });
            }
        }

        [HttpPut("inward/{id}")]
        [AllowAnonymous] // Allow anonymous access for testing
        public async Task<ActionResult<CorrespondenceInwardDto>> UpdateInward(int id,
            [FromBody] UpdateCorrespondenceInwardCommand command)
        {
            try
            {
                if (command == null)
                {
                    return BadRequest("Inward correspondence data is null.");
                }

                if (id != command.Id)
                {
                    return BadRequest("Mismatched inward correspondence ID.");
                }

                // Get the username from the authenticated user or use "System" as fallback
                command.UpdatedBy = User.Identity?.IsAuthenticated == true
                    ? User.FindFirstValue(ClaimTypes.Name) ?? "System"
                    : "System";
                var result = await _mediator.Send(command);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating inward correspondence with ID {Id}", id);
                return StatusCode(500,
                    new
                    {
                        message = $"An error occurred while updating inward correspondence with ID {id}.",
                        error = ex.Message
                    });
            }
        }

        [HttpDelete("inward/{id}")]
        [AllowAnonymous] // Allow anonymous access for testing
        public async Task<ActionResult> DeleteInward(int id)
        {
            try
            {
                var command = new DeleteCorrespondenceInwardCommand { Id = id };
                var result = await _mediator.Send(command);

                if (!result)
                {
                    return NotFound($"Inward correspondence with ID {id} not found.");
                }

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting inward correspondence with ID {Id}", id);
                return StatusCode(500,
                    new
                    {
                        message = $"An error occurred while deleting inward correspondence with ID {id}.",
                        error = ex.Message
                    });
            }
        }

        #endregion

        #region Outward Correspondence

        [HttpGet("outward")]
        [AllowAnonymous] // Allow anonymous access for testing
        public async Task<ActionResult<IEnumerable<CorrespondenceOutwardDto>>> GetAllOutward()
        {
            try
            {
                var query = new GetAllCorrespondenceOutwardsQuery();
                var result = await _mediator.Send(query);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all outward correspondence");
                return StatusCode(500,
                    new { message = "An error occurred while retrieving outward correspondence.", error = ex.Message });
            }
        }

        [HttpGet("outward/{id}")]
        [AllowAnonymous] // Allow anonymous access for testing
        public async Task<ActionResult<CorrespondenceOutwardDto>> GetOutwardById(int id)
        {
            try
            {
                var query = new GetCorrespondenceOutwardByIdQuery { Id = id };
                var result = await _mediator.Send(query);

                if (result == null)
                {
                    return NotFound($"Outward correspondence with ID {id} not found.");
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting outward correspondence with ID {Id}", id);
                return StatusCode(500,
                    new
                    {
                        message = $"An error occurred while retrieving outward correspondence with ID {id}.",
                        error = ex.Message
                    });
            }
        }

        [HttpGet("outward/project/{projectId}")]
        [AllowAnonymous] // Allow anonymous access for testing
        public async Task<ActionResult<IEnumerable<CorrespondenceOutwardDto>>> GetOutwardByProject(int projectId)
        {
            try
            {
                var query = new GetCorrespondenceOutwardsByProjectQuery { ProjectId = projectId };
                var result = await _mediator.Send(query);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting outward correspondence for project {ProjectId}", projectId);
                return StatusCode(500,
                    new
                    {
                        message = $"An error occurred while retrieving outward correspondence for project {projectId}.",
                        error = ex.Message
                    });
            }
        }

        [HttpPost("outward")]
        [AllowAnonymous] // Allow anonymous access for testing
        public async Task<ActionResult<CorrespondenceOutwardDto>> CreateOutward(
            [FromBody] CreateCorrespondenceOutwardCommand command)
        {
            try
            {
                if (command == null)
                {
                    return BadRequest("Outward correspondence data is null.");
                }

                // Get the username from the authenticated user or use "System" as fallback
                command.CreatedBy = User.Identity?.IsAuthenticated == true
                    ? User.FindFirstValue(ClaimTypes.Name) ?? "System"
                    : "System";

                try
                {
                    var result = await _mediator.Send(command);
                    return CreatedAtAction(nameof(GetOutwardById), new { id = result.Id }, result);
                }
                catch (InvalidOperationException ex) when (ex.Message.Contains("already exists for project ID"))
                {
                    // An entry already exists for this project
                    return BadRequest(new { message = ex.Message });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating outward correspondence");
                return StatusCode(500,
                    new { message = "An error occurred while creating outward correspondence.", error = ex.Message });
            }
        }

        [HttpPut("outward/{id}")]
        [AllowAnonymous] // Allow anonymous access for testing
        public async Task<ActionResult<CorrespondenceOutwardDto>> UpdateOutward(int id,
            [FromBody] UpdateCorrespondenceOutwardCommand command)
        {
            try
            {
                if (command == null)
                {
                    return BadRequest("Outward correspondence data is null.");
                }

                if (id != command.Id)
                {
                    return BadRequest("Mismatched outward correspondence ID.");
                }

                // Get the username from the authenticated user or use "System" as fallback
                command.UpdatedBy = User.Identity?.IsAuthenticated == true
                    ? User.FindFirstValue(ClaimTypes.Name) ?? "System"
                    : "System";
                var result = await _mediator.Send(command);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating outward correspondence with ID {Id}", id);
                return StatusCode(500,
                    new
                    {
                        message = $"An error occurred while updating outward correspondence with ID {id}.",
                        error = ex.Message
                    });
            }
        }

        [HttpDelete("outward/{id}")]
        [AllowAnonymous] // Allow anonymous access for testing
        public async Task<ActionResult> DeleteOutward(int id)
        {
            try
            {
                var command = new DeleteCorrespondenceOutwardCommand { Id = id };
                var result = await _mediator.Send(command);

                if (!result)
                {
                    return NotFound($"Outward correspondence with ID {id} not found.");
                }

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting outward correspondence with ID {Id}", id);
                return StatusCode(500,
                    new
                    {
                        message = $"An error occurred while deleting outward correspondence with ID {id}.",
                        error = ex.Message
                    });
            }
        }

        #endregion
    }
}

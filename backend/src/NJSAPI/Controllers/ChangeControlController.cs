
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NJS.Application.CQRS.ChangeControl.Commands;
using NJS.Application.CQRS.ChangeControl.Queries;
using NJS.Application.Dtos;

namespace NJSAPI.Controllers
{
    [Route("api/projects/{projectId}/changecontrols")]
    [ApiController]
    [Authorize]
    public class ChangeControlController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly ILogger<ChangeControlController> _logger;

        public ChangeControlController(IMediator mediator, ILogger<ChangeControlController> logger)
        {
            _mediator = mediator ?? throw new ArgumentNullException(nameof(mediator));
            _logger = logger;
        }

        // GET: api/projects/{projectId}/changecontrols
        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<ChangeControlDto>), StatusCodes.Status200OK)]
        public async Task<ActionResult<IEnumerable<ChangeControlDto>>> GetChangeControlsByProjectId(int projectId)
        {
            try
            {
                var query = new GetChangeControlsByProjectIdQuery(projectId);
                var result = await _mediator.Send(query);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"An error occurred while retrieving change controls for project {projectId}.", error = ex.Message });
            }
        }

        // GET: api/projects/{projectId}/changecontrols/{id}
        [HttpGet("{id}")]
        [ProducesResponseType(typeof(ChangeControlDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<ChangeControlDto>> GetChangeControlById(int projectId, int id)
        {
            try
            {
                var query = new GetChangeControlByIdQuery(id);
                var result = await _mediator.Send(query);

                if (result == null)
                {
                    return NotFound($"Change control with ID {id} not found.");
                }

                // Verify that the change control belongs to the specified project
                if (result.ProjectId != projectId)
                {
                    return NotFound($"Change control with ID {id} does not belong to project {projectId}.");
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"An error occurred while retrieving change control {id}.", error = ex.Message });
            }
        }

        // POST: api/projects/{projectId}/changecontrols
        [HttpPost]
        [ProducesResponseType(typeof(ChangeControlDto), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<ChangeControlDto>> CreateChangeControl(int projectId, [FromBody] ChangeControlDto changeControlDto)
        {
            try
            {
                if (changeControlDto == null)
                {
                    return BadRequest(new { message = "Change control data is null." });
                }


                if (changeControlDto.ProjectId != projectId)
                {
                    changeControlDto.ProjectId = projectId;
                }

                // Ensure string fields are not null
                changeControlDto.Originator = changeControlDto.Originator ?? string.Empty;
                changeControlDto.Description = changeControlDto.Description ?? string.Empty;
                changeControlDto.CostImpact = changeControlDto.CostImpact ?? string.Empty;
                changeControlDto.TimeImpact = changeControlDto.TimeImpact ?? string.Empty;
                changeControlDto.ResourcesImpact = changeControlDto.ResourcesImpact ?? string.Empty;
                changeControlDto.QualityImpact = changeControlDto.QualityImpact ?? string.Empty;
                changeControlDto.ChangeOrderStatus = changeControlDto.ChangeOrderStatus ?? string.Empty;
                changeControlDto.ClientApprovalStatus = changeControlDto.ClientApprovalStatus ?? string.Empty;
                changeControlDto.ClaimSituation = changeControlDto.ClaimSituation ?? string.Empty;

                // Always set CreatedBy and UpdatedBy in the backend
                changeControlDto.CreatedBy = User.Identity?.Name ?? "System";
                changeControlDto.UpdatedBy = User.Identity?.Name ?? "System";

                var command = new CreateChangeControlCommand(changeControlDto);
                var id = await _mediator.Send(command);

                // Get the created entity to return in the response
                var query = new GetChangeControlByIdQuery(id);
                var createdEntity = await _mediator.Send(query);

                return CreatedAtAction(nameof(GetChangeControlById), new { projectId, id }, createdEntity);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while creating change control.", error = ex.Message });
            }
        }

        // PUT: api/projects/{projectId}/changecontrols/{id}
        [HttpPut("{id}")]
        [ProducesResponseType(typeof(ChangeControlDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<ChangeControlDto>> UpdateChangeControl(int projectId, int id, [FromBody] ChangeControlDto changeControlDto)
        {
            try
            {
                
                if (changeControlDto == null)
                {
                    return BadRequest(new { message = "Change control data is null." });
                }

                if (id != changeControlDto.Id)
                {
                    return BadRequest(new { message = "ID mismatch between route and request body." });
                }

                if (changeControlDto.ProjectId != projectId)
                {
                    return BadRequest(new { message = "Project ID mismatch between route and request body." });
                }


                // Ensure string fields are not null
                changeControlDto.Originator = changeControlDto.Originator ?? string.Empty;
                changeControlDto.Description = changeControlDto.Description ?? string.Empty;
                changeControlDto.CostImpact = changeControlDto.CostImpact ?? string.Empty;
                changeControlDto.TimeImpact = changeControlDto.TimeImpact ?? string.Empty;
                changeControlDto.ResourcesImpact = changeControlDto.ResourcesImpact ?? string.Empty;
                changeControlDto.QualityImpact = changeControlDto.QualityImpact ?? string.Empty;
                changeControlDto.ChangeOrderStatus = changeControlDto.ChangeOrderStatus ?? string.Empty;
                changeControlDto.ClientApprovalStatus = changeControlDto.ClientApprovalStatus ?? string.Empty;
                changeControlDto.ClaimSituation = changeControlDto.ClaimSituation ?? string.Empty;

                // Always set UpdatedBy in the backend
                changeControlDto.UpdatedBy = User.Identity?.Name ?? "System";

                var command = new UpdateChangeControlCommand(changeControlDto);
                var result = await _mediator.Send(command);

                return Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"An error occurred while updating change control {id}.", error = ex.Message });
            }
        }

        // DELETE: api/projects/{projectId}/changecontrols/{id}
        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeleteChangeControl(int projectId, int id)
        {
            try
            {
                // First, verify that the change control exists and belongs to the specified project
                var query = new GetChangeControlByIdQuery(id);
                var existingChangeControl = await _mediator.Send(query);

                if (existingChangeControl == null)
                {
                    return NotFound(new { message = $"Change control with ID {id} not found." });
                }

                if (existingChangeControl.ProjectId != projectId)
                {
                    return NotFound(new { message = $"Change control with ID {id} does not belong to project {projectId}." });
                }

                var command = new DeleteChangeControlCommand(id);
                await _mediator.Send(command);

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"An error occurred while deleting change control {id}.", error = ex.Message });
            }
        }
    }
}

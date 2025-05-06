using MediatR;
using Microsoft.AspNetCore.Mvc;
using NJS.Application.Dtos;
using NJS.Application.CQRS.JobStartForm.Commands;
using NJS.Application.CQRS.JobStartForm.Queries;
using NJS.Application.CQRS.WorkBreakdownStructures.Queries;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http; // Added for StatusCodes
using Microsoft.AspNetCore.Authorization; // Added

namespace NJSAPI.Controllers
{
    [Route("api/projects/{projectId}/jobstartforms")] // Simplified route for now
    [ApiController]
    [Authorize] // Added
    public class JobStartFormController : ControllerBase
    {
        private readonly IMediator _mediator;

        public JobStartFormController(IMediator mediator)
        {
            _mediator = mediator;
        }

        // GET: api/projects/{projectId}/jobstartforms
        [HttpGet]
        [AllowAnonymous] // Allow access without authentication for this specific endpoint
        [ProducesResponseType(typeof(IEnumerable<JobStartFormDto>), StatusCodes.Status200OK)]
        public async Task<ActionResult<IEnumerable<JobStartFormDto>>> GetAllJobStartForms(int projectId)
        {
            var query = new GetAllJobStartFormByProjectIdQuery(projectId);
            var result = await _mediator.Send(query);
            return Ok(result);
        }

        // GET: api/projects/{projectId}/jobstartforms/{id}
        [HttpGet("{id}")]
        [AllowAnonymous] // Allow access without authentication for this specific endpoint
        [ProducesResponseType(typeof(JobStartFormDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<JobStartFormDto>> GetJobStartFormById(int projectId, int id) // projectId might be needed for authorization/context
        {
            var query = new GetJobStartFormByIdQuery(id);
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

// POST: api/projects/{projectId}/jobstartforms
[HttpPost]
[ProducesResponseType(typeof(JobStartFormDto), StatusCodes.Status201Created)]
[ProducesResponseType(StatusCodes.Status400BadRequest)]
public async Task<ActionResult<JobStartFormDto>> CreateJobStartForm(int projectId, [FromBody] JobStartFormDto createDto)
{
    if (createDto == null)
    {
        return BadRequest("Job Start Form data is required.");
    }

    // Ensure the ProjectId in the DTO matches the route parameter
    if (createDto.ProjectId != projectId)
    {
         return BadRequest("ProjectId mismatch between route and body.");
    }

    var command = new CreateJobStartFormCommand(createDto);
    var newId = await _mediator.Send(command);

    // Fetch the created entity to return it
    var query = new GetJobStartFormByIdQuery(newId);
    var createdDto = await _mediator.Send(query);

    return CreatedAtAction(nameof(GetJobStartFormById), new { projectId = projectId, id = newId }, createdDto);
}

        // PUT: api/projects/{projectId}/jobstartforms/{id}
        [HttpPut("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateJobStartForm(int projectId, int id, [FromBody] JobStartFormDto updateDto)
        {
            if (updateDto == null || id != updateDto.FormId)
            {
                return BadRequest("Invalid request data or ID mismatch.");
            }

             // Ensure the ProjectId in the DTO matches the route parameter
            if (updateDto.ProjectId != projectId)
            {
                 return BadRequest("ProjectId mismatch between route and body.");
            }

            // Optional: Check if the entity exists before sending the update command
            var checkQuery = new GetJobStartFormByIdQuery(id);
            var existing = await _mediator.Send(checkQuery);
            if (existing == null || existing.ProjectId != projectId)
            {
                return NotFound(); // Or Forbid() if project mismatch
            }


            var command = new UpdateJobStartFormCommand(updateDto);
            await _mediator.Send(command); // Assuming handler handles NotFound case if necessary

            return NoContent();
        }

        // DELETE: api/projects/{projectId}/jobstartforms/{id}
        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeleteJobStartForm(int projectId, int id)
        {
             // Optional: Check if the entity exists and belongs to the project before sending the delete command
            var checkQuery = new GetJobStartFormByIdQuery(id);
            var existing = await _mediator.Send(checkQuery);
            if (existing == null || existing.ProjectId != projectId)
            {
                return NotFound(); // Or Forbid()
            }

            var command = new DeleteJobStartFormCommand(id);
            await _mediator.Send(command); // Assuming handler handles NotFound case if necessary

            return NoContent();
        }

        // GET: api/projects/{projectId}/jobstartforms/wbsresources
        [HttpGet("wbsresources")]
        [AllowAnonymous] // Allow access without authentication for this specific endpoint
        [ProducesResponseType(typeof(WBSResourceDataDto), StatusCodes.Status200OK)]
        public async Task<ActionResult<WBSResourceDataDto>> GetWBSResourceData(int projectId)
        {
            var query = new GetWBSResourceDataQuery(projectId);
            var result = await _mediator.Send(query);
            return Ok(result);
        }
    }
}

using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using NJS.Application.Dtos;
using NJS.Application.CQRS.WorkBreakdownStructures.Commands;
using NJS.Application.CQRS.WorkBreakdownStructures.Queries;

namespace NJSAPI.Controllers
{
    [Route("api/projects/{projectId}/[controller]")]
    [ApiController]
    public class WBSController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly ILogger<WBSController> _logger;

        public WBSController(IMediator mediator, ILogger<WBSController> logger)
        {
            _mediator = mediator;
            _logger = logger;
        }

        /// <summary>
        /// Gets the active Work Breakdown Structure for a project.
        /// </summary>
        /// <param name="projectId">The ID of the project.</param>
        /// <returns>The WBS structure including tasks.</returns>
        [HttpGet]
        [ProducesResponseType(typeof(WBSStructureDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)] // If handler throws NotFoundException
        public async Task<ActionResult<WBSStructureDto>> GetWBS(int projectId)
        {
            // Use the renamed query GetWBSByProjectIdQuery
            var result = await _mediator.Send(new GetWBSByProjectIdQuery(projectId));
            // The handler now returns an empty structure instead of throwing NotFound,
            // so we might not need specific 404 handling here unless requirements change.
            return Ok(result);
        }

        /// <summary>
        /// Creates or replaces the entire Work Breakdown Structure for a project.
        /// </summary>
        /// <param name="projectId">The ID of the project.</param>
        /// <param name="tasks">A list representing the desired state of WBS tasks.</param>
        /// <returns>No content if successful.</returns>
        [HttpPut]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)] // If handler throws NotFoundException for project
        public async Task<IActionResult> SetWBS(int projectId, [FromBody] List<WBSTaskDto> tasks)
        {
            if (tasks == null)
            {
                return BadRequest("WBS task list cannot be null.");
            }
            // Basic validation: Check if ParentIds point to valid Ids within the list for new tasks? Optional.

            var command = new SetWBSCommand(projectId, tasks);
            await _mediator.Send(command);
            return NoContent();
        }

        /// <summary>
        /// Adds a new task to the Work Breakdown Structure for a project.
        /// </summary>
        /// <param name="projectId">The ID of the project.</param>
        /// <param name="taskDto">The details of the task to add.</param>
        /// <returns>The created task details.</returns>
        [HttpPost("tasks")]
        [ProducesResponseType(typeof(WBSTaskDto), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)] // If WBS not found
        public async Task<ActionResult<WBSTaskDto>> AddTask(int projectId, [FromBody] WBSTaskDto taskDto)
        {
            if (taskDto == null)
            {
                return BadRequest("Task data cannot be null.");
            }
            if (taskDto.Id != 0)
            {
                return BadRequest("ID must be 0 for a new task.");
            }

            var command = new AddWBSTaskCommand(projectId, taskDto);
            var createdTask = await _mediator.Send(command);

            // Return the complete created task data
            return CreatedAtAction(nameof(GetWBS), new { projectId }, createdTask);
        }

        /// <summary>
        /// Updates a specific task within the Work Breakdown Structure.
        /// </summary>
        /// <param name="projectId">The ID of the project.</param>
        /// <param name="taskId">The ID of the task to update.</param>
        /// <param name="taskDto">The updated task details.</param>
        /// <returns>The updated task data.</returns>
        [HttpPut("tasks/{taskId}")]
        [ProducesResponseType(typeof(WBSTaskDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)] // If task or WBS not found
        public async Task<ActionResult<WBSTaskDto>> UpdateTask(int projectId, int taskId, [FromBody] WBSTaskDto taskDto)
        {
            if (taskDto == null)
            {
                return BadRequest("Task data cannot be null.");
            }
            if (taskId != taskDto.Id)
            {
                // Ensure the ID in the route matches the ID in the body
                return BadRequest("Task ID mismatch between route and body.");
            }

            var command = new UpdateWBSTaskCommand(projectId, taskId, taskDto);
            var updatedTask = await _mediator.Send(command);
            return Ok(updatedTask);
        }

        /// <summary>
        /// Deletes (soft deletes) a specific task from the Work Breakdown Structure.
        /// </summary>
        /// <param name="projectId">The ID of the project.</param>
        /// <param name="taskId">The ID of the task to delete.</param>
        /// <returns>The deleted task data.</returns>
        [HttpDelete("tasks/{taskId}")]
        [ProducesResponseType(typeof(WBSTaskDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)] // If task not found
        public async Task<ActionResult<WBSTaskDto>> DeleteTask(int projectId, int taskId)
        {
            var command = new DeleteWBSTaskCommand(projectId, taskId);
            var deletedTask = await _mediator.Send(command);
            return Ok(deletedTask);
        }

        // TODO: Consider adding a GetTaskById endpoint if needed for CreatedAtAction links.
        // [HttpGet("tasks/{taskId}")]
        // public async Task<ActionResult<WBSTaskDto>> GetTaskById(int projectId, int taskId) { ... }

        /// <summary>
        /// Gets manpower resources with planned hours for a project.
        /// </summary>
        /// <param name="projectId">The ID of the project.</param>
        /// <returns>Manpower resources with planned hours data.</returns>
        /// <response code="200">Returns the manpower resources with planned hours.</response>
        /// <response code="404">If the project is not found.</response>
        /// <response code="500">If an unexpected error occurs.</response>
        [HttpGet("manpowerresources")]
        [ProducesResponseType(typeof(ManpowerResourcesWithPlannedHoursDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<ManpowerResourcesWithPlannedHoursDto>> GetManpowerResourcesWithPlannedHours(int projectId)
        {
            try
            {
                _logger.LogInformation("Retrieving manpower resources with planned hours for project {ProjectId}", projectId);

                var query = new GetManpowerResourcesWithPlannedHoursQuery(projectId);
                var result = await _mediator.Send(query);
                
                if (result == null)
                {
                    _logger.LogWarning("Project {ProjectId} not found", projectId);
                    return NotFound(new { error = $"Project with ID {projectId} not found" });
                }
                
                return Ok(result);
            }
            catch (ArgumentOutOfRangeException ex)
            {
                _logger.LogWarning(ex, "Invalid project ID: {ProjectId}", projectId);
                return BadRequest(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving manpower resources for project {ProjectId}", projectId);
                return StatusCode(StatusCodes.Status500InternalServerError, 
                    new { error = "An unexpected error occurred while retrieving manpower resources." });
            }
        }

        /// <summary>
        /// Gets approved Work Breakdown Structures for a project.
        /// </summary>
        /// <param name="projectId">The ID of the project (optional).</param>
        /// <returns>A list of approved WBS structures.</returns>
        [HttpGet("Approved")]
        [ProducesResponseType(typeof(List<WBSDetailsDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetApprovedWBS([FromQuery] int? projectId)
        {
            _logger.LogInformation("Received request for GetApprovedWBS for ProjectId: {ProjectId}", projectId);
            try
            {
                var query = new GetApprovedWBSQuery { ProjectId = projectId };
                var result = await _mediator.Send(query);
                _logger.LogInformation("Successfully returned approved WBS data for ProjectId: {ProjectId}", projectId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting approved WBS for ProjectId: {ProjectId}", projectId);
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while retrieving approved WBS data.");
            }
        }
    }
}

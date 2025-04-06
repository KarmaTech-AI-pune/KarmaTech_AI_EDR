using MediatR;
using Microsoft.AspNetCore.Mvc;
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

        public WBSController(IMediator mediator)
        {
            _mediator = mediator;
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
        /// <returns>The created task details or its ID.</returns>
        [HttpPost("tasks")]
        [ProducesResponseType(typeof(WBSTaskDto), StatusCodes.Status201Created)] // Or just the ID
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
            var newTaskId = await _mediator.Send(command);

            // Optionally, retrieve the created task to return it (requires a GetTaskByIdQuery)
            // For now, returning the ID in the location header is standard REST practice.
            // taskDto.Id = newTaskId; // Update DTO with new ID if returning it
            // return CreatedAtAction(nameof(GetTaskById), new { projectId, taskId = newTaskId }, taskDto);

            // Returning location header with ID
             return CreatedAtAction(nameof(GetWBS), new { projectId }, new { id = newTaskId }); // Pointing to GetWBS for simplicity, ideally GetTaskById
        }

        /// <summary>
        /// Updates a specific task within the Work Breakdown Structure.
        /// </summary>
        /// <param name="projectId">The ID of the project.</param>
        /// <param name="taskId">The ID of the task to update.</param>
        /// <param name="taskDto">The updated task details.</param>
        /// <returns>No content if successful.</returns>
        [HttpPut("tasks/{taskId}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)] // If task or WBS not found
        public async Task<IActionResult> UpdateTask(int projectId, int taskId, [FromBody] WBSTaskDto taskDto)
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
            await _mediator.Send(command);
            return NoContent();
        }

        /// <summary>
        /// Deletes (soft deletes) a specific task from the Work Breakdown Structure.
        /// </summary>
        /// <param name="projectId">The ID of the project.</param>
        /// <param name="taskId">The ID of the task to delete.</param>
        /// <returns>No content if successful.</returns>
        [HttpDelete("tasks/{taskId}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)] // If task not found (optional, handler returns success if already deleted)
        public async Task<IActionResult> DeleteTask(int projectId, int taskId)
        {
            var command = new DeleteWBSTaskCommand(projectId, taskId);
            await _mediator.Send(command);
            return NoContent();
        }

        // TODO: Consider adding a GetTaskById endpoint if needed for CreatedAtAction links.
        // [HttpGet("tasks/{taskId}")]
        // public async Task<ActionResult<WBSTaskDto>> GetTaskById(int projectId, int taskId) { ... }
    }
}

using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NJS.Application.Dtos;
using NJS.Application.CQRS.WorkBreakdownStructures.Commands;
using NJS.Application.CQRS.WorkBreakdownStructures.Queries;

namespace NJSAPI.Controllers
{
    [Route("api/projects/{projectId}/[controller]")]
    [ApiController]
    [Authorize]
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
        /// <returns>The WBS header with all workBreakdownStructures array and tasks.</returns>
        /// <remarks>
        /// Response structure:
        /// {
        ///   "id": 101,  // wbsHeaderId
        ///   "workBreakdownStructures": [
        ///     {
        ///       "workBreakdownStructureId": 1,
        ///       "name": "Foundation",
        ///       "description": "Base structure",
        ///       "displayOrder": 1,
        ///       "tasks": [...]
        ///     }
        ///   ]
        /// }
        /// </remarks>
        [HttpGet]
        [ProducesResponseType(typeof(WBSHeaderDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<WBSHeaderDto>> GetWBS(int projectId)
        {
            var result = await _mediator.Send(new GetWBSByProjectIdQuery(projectId));
            return Ok(result);
        }

        /// <summary>
        /// Creates or replaces the entire Work Breakdown Structure for a project.
        /// </summary>
        /// <param name="projectId">The ID of the project.</param>
        /// <param name="wbsMaster">The WBS master data including workBreakdownStructures array with tasks.</param>
        /// <returns>No content if successful.</returns>
        /// <remarks>
        /// Sample request:
        ///
        ///     PUT /api/projects/1/wbs
        ///     {
        ///       "wbsHeaderId": 101,
        ///       "workBreakdownStructures": [
        ///         {
        ///           "workBreakdownStructureId": 1,
        ///           "name": "Foundation",
        ///           "description": "Base structure for building foundation",
        ///           "displayOrder": 1,
        ///           "tasks": [
        ///             {
        ///               "id": 0,
        ///               "workBreakdownStructureId": 1,
        ///               "parentId": 0,
        ///               "level": 1,
        ///               "title": "Site Preparation",
        ///               "description": "Prepare site for construction",
        ///               "displayOrder": 1,
        ///               "wbsOptionId": 1,
        ///               "wbsOptionLabel": "Standard Work"
        ///             }
        ///           ]
        ///         }
        ///       ]
        ///     }
        ///
        /// </remarks>
        [HttpPut]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> SetWBS(int projectId, [FromBody] WBSMasterDto wbsMaster)
        {
            if (wbsMaster == null)
            {
                return BadRequest("WBS master data cannot be null.");
            }

            if (wbsMaster.WorkBreakdownStructures == null || !wbsMaster.WorkBreakdownStructures.Any())
            {
                return BadRequest("WorkBreakdownStructures array cannot be null or empty.");
            }

            // Map WBSMasterDto to WBSHeaderDto for the command
            var wbsHeader = new WBSHeaderDto
            {
                Id = wbsMaster.WbsHeaderId,
                ProjectId = projectId,
                WorkBreakdownStructures = wbsMaster.WorkBreakdownStructures.Select(wbs => new WBSStructureDto
                {
                    WorkBreakdownStructureId = wbs.WorkBreakdownStructureId,
                    Name = wbs.Name,
                    Description = wbs.Description,
                    DisplayOrder = wbs.DisplayOrder,
                    Tasks = wbs.Tasks
                }).ToList()
            };

            var command = new SetWBSCommand(projectId, wbsHeader);
            await _mediator.Send(command);
            return NoContent();
        }

        /// <summary>
        /// Adds new tasks to the Work Breakdown Structure for a project.
        /// </summary>
        /// <param name="projectId">The ID of the project.</param>
        /// <param name="tasksDto">A list of tasks to add.</param>
        /// <returns>The list of created task details.</returns>
        [HttpPost("tasks")]
        [ProducesResponseType(typeof(List<WBSTaskDto>), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)] // If WBS not found
        public async Task<ActionResult<List<WBSTaskDto>>> AddTask(int projectId, [FromBody] List<WBSTaskDto> tasksDto)
        {
            if (tasksDto == null || !tasksDto.Any())
            {
                return BadRequest("Task data cannot be null or empty.");
            }
            if (tasksDto.Any(t => t.Id != 0))
            {
                return BadRequest("IDs must be 0 for new tasks.");
            }

            var command = new AddWBSTaskCommand(projectId, tasksDto);
            var createdTasksDto = await _mediator.Send(command);
          
            // For a list of created items, it's common to return 201 Created with the list in the body.
            return StatusCode(StatusCodes.Status201Created, createdTasksDto);
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

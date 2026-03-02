using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using EDR.Application.Dtos;
using EDR.Application.CQRS.WorkBreakdownStructures.Commands;
using EDR.Application.CQRS.WorkBreakdownStructures.Queries;

namespace EDR.API.Controllers
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
        /// <returns>The WBS master data with all workBreakdownStructures array and tasks.</returns>
        /// <remarks>
        /// Response structure:
        /// {
        ///   "wbsHeaderId": 101,
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
        [ProducesResponseType(typeof(WBSMasterDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<WBSMasterDto>> GetWBS(int projectId)
        {
            var result = await _mediator.Send(new GetWBSByProjectIdQuery(projectId));
            return Ok(result);
        }

        /// <summary>
        /// Gets only Level 3 Work Breakdown Structure tasks for a project.
        /// </summary>
        /// <param name="projectId">The ID of the project.</param>
        /// <returns>A list of Level 3 tasks with all related data.</returns>
        [HttpGet("level-three")]
        [ProducesResponseType(typeof(List<WBSTaskDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<List<WBSTaskDto>>> GetLevelThreeWBSTasks(int projectId)
        {
            var result = await _mediator.Send(new GetLevelThreeWbsTasksByProjectIdQuery(projectId));
            return Ok(result);
        }

        /// <summary>
        /// Creates or replaces the entire Work Breakdown Structure for a project.
        /// </summary>
        /// <param name="projectId">The ID of the project.</param>
        /// <param name="wbsMaster">The WBS master data including workBreakdownStructures array with tasks.</param>
        /// <returns>The saved WBS master data with generated IDs.</returns>
        /// Note: For new entities, use 0 for IDs (wbsHeaderId, workBreakdownStructureId, id).
        /// The response will contain the saved data with generated IDs.
        /// </remarks>
        [HttpPut]
        [ProducesResponseType(typeof(WBSMasterDto), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<WBSMasterDto>> SetWBS(int projectId, [FromBody] WBSMasterDto wbsMaster)
        {
            try
            {
                _logger.LogInformation("SetWBS called for ProjectId: {ProjectId}, WbsHeaderId: {WbsHeaderId}",
                    projectId, wbsMaster?.WbsHeaderId);

                if (wbsMaster == null)
                {
                    _logger.LogWarning("SetWBS: WBS master data is null");
                    return BadRequest("WBS master data cannot be null.");
                }

                if (wbsMaster.WorkBreakdownStructures == null || !wbsMaster.WorkBreakdownStructures.Any())
                {
                    _logger.LogWarning("SetWBS: WorkBreakdownStructures array is null or empty");
                    return BadRequest("WorkBreakdownStructures array cannot be null or empty.");
                }

                _logger.LogInformation("SetWBS: Processing {Count} WBS groups with {TaskCount} total tasks",
                    wbsMaster.WorkBreakdownStructures.Count,
                    wbsMaster.WorkBreakdownStructures.Sum(w => w.Tasks?.Count ?? 0));

                var command = new SetWBSCommand(projectId, wbsMaster);
                var savedData = await _mediator.Send(command);

                _logger.LogInformation("SetWBS command executed successfully for ProjectId: {ProjectId}", projectId);

                if (savedData == null)
                {
                    _logger.LogError("SetWBS: Failed to save WBS data for ProjectId: {ProjectId}", projectId);
                    return StatusCode(StatusCodes.Status500InternalServerError,
                        new { message = "WBS was not saved successfully." });
                }

                _logger.LogInformation("Returning saved WBS data for ProjectId: {ProjectId}, WbsHeaderId: {WbsHeaderId}, WBS Groups: {Count}, Total Tasks: {TaskCount}",
                    projectId,
                    savedData.WbsHeaderId,
                    savedData.WorkBreakdownStructures?.Count ?? 0,
                    savedData.WorkBreakdownStructures?.Sum(w => w.Tasks?.Count ?? 0) ?? 0);

                return StatusCode(StatusCodes.Status201Created, savedData);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in SetWBS for ProjectId: {ProjectId}", projectId);
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new { message = "An error occurred while saving WBS data.", error = ex.Message });
            }
        }

        /// <summary>
        /// Adds new tasks to the Work Breakdown Structure for a project using WBSMasterDto.
        /// </summary>
        /// <param name="projectId">The ID of the project.</param>
        /// <param name="wbsMaster">The WBS master data with tasks to add.</param>
        /// <returns>The updated WBS master data.</returns>
        [HttpPost("tasks")]
        [ProducesResponseType(typeof(WBSMasterDto), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<WBSMasterDto>> AddTask(int projectId, [FromBody] WBSMasterDto wbsMaster)
        {
            if (wbsMaster == null)
            {
                return BadRequest("WBS master data cannot be null.");
            }

            var command = new AddWBSTaskCommand(projectId, wbsMaster);
            var result = await _mediator.Send(command);

            return StatusCode(StatusCodes.Status201Created, result);
        }

        /// <summary>
        /// Updates the Work Breakdown Structure using WBSMasterDto.
        /// </summary>
        /// <param name="projectId">The ID of the project.</param>
        /// <param name="wbsMaster">The WBS master data with updated tasks.</param>
        /// <returns>The updated WBS master data.</returns>
        [HttpPut("tasks")]
        [ProducesResponseType(typeof(WBSMasterDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<WBSMasterDto>> UpdateTask(int projectId, [FromBody] WBSMasterDto wbsMaster)
        {
            if (wbsMaster == null)
            {
                return BadRequest("WBS master data cannot be null.");
            }

            var command = new UpdateWBSTaskCommand(projectId, wbsMaster);
            var result = await _mediator.Send(command);
            return Ok(result);
        }

        /// <summary>
        /// Deletes a task from the Work Breakdown Structure by its ID.
        /// </summary>
        /// <param name="projectId">The ID of the project.</param>
        /// <param name="wbsTaskId">The ID of the WBS task to delete.</param>
        /// <returns>Result of deletion.</returns>
        [HttpDelete("tasks")]
        [ProducesResponseType(typeof(bool), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<bool>> DeleteTask(int projectId, [FromQuery] int wbsTaskId)
        {
            var command = new DeleteWBSTaskCommand(projectId, wbsTaskId);
            var result = await _mediator.Send(command);

            if (!result)
            {
                 return NotFound($"WBSTask with Id {wbsTaskId} not found in Project {projectId}");
            }

            return Ok(result);
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


using MediatR;
using Microsoft.AspNetCore.Mvc;
using NJS.Application.CQRS.SprintPlans.Commands;
using NJS.Application.CQRS.SprintPlans.Queries;
using NJS.Application.CQRS.SprintTasks.Commands;
using NJS.Application.CQRS.SprintTasks.Queries;
using NJS.Application.Dtos;
using Microsoft.AspNetCore.Authorization;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;

namespace NJSAPI.Controllers
{
    [ApiController]
    [Route("api/sprint-tasks")]
    [Authorize]
    public class SprintTaskController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly ILogger<SprintTaskController> _logger;

        public SprintTaskController(IMediator mediator, ILogger<SprintTaskController> logger)
        {
            _mediator = mediator ?? throw new ArgumentNullException(nameof(mediator));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        /// <summary>
        /// Creates a single SprintPlan entry without associated tasks or subtasks.
        /// </summary>
        /// <param name="sprintPlanDto">The SprintPlan data to create.</param>
        /// <returns>The ID of the newly created SprintPlan.</returns>
        [HttpPost("single-sprint-plan")]
        [ProducesResponseType(typeof(int), 201)]
        [ProducesResponseType(400)]
        [ProducesResponseType(500)]
        public async Task<IActionResult> CreateSingleSprintPlan([FromBody] SprintPlanDto sprintPlanDto)
        {
            if (!ModelState.IsValid)
            {
                _logger.LogWarning("Invalid ModelState for CreateSingleSprintPlan: {@ModelState}", ModelState);
                return BadRequest(ModelState);
            }

            try
            {
                var command = new CreateSingleSprintPlanCommand { SprintPlan = sprintPlanDto };
                var sprintPlanId = await _mediator.Send(command);

                _logger.LogInformation("Single SprintPlan created successfully with ID: {SprintPlanId}", sprintPlanId);
                return CreatedAtAction(nameof(GetSingleSprintPlan), new { sprintId = sprintPlanId }, sprintPlanId);
            }
            catch (ArgumentException ex)
            {
                _logger.LogError(ex, "Validation error creating single SprintPlan: {Message}", ex.Message);
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating single SprintPlan.");
                return StatusCode(500, new { message = "An unexpected error occurred.", details = ex.Message });
            }
        }

        /// <summary>
        /// Gets a single SprintPlan by its ID.
        /// </summary>
        /// <param name="sprintId">The ID of the SprintPlan.</param>
        /// <returns>The SprintPlan data.</returns>
        [HttpGet("single-sprint-plan/{sprintId}")]
        [ProducesResponseType(typeof(SprintPlanDto), 200)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> GetSingleSprintPlan(int sprintId)
        {
            _logger.LogInformation("Attempting to retrieve single SprintPlan with ID: {SprintId}", sprintId);

            try
            {
                var query = new GetSingleSprintPlanQuery { SprintId = sprintId };
                var sprintPlanDto = await _mediator.Send(query);

                if (sprintPlanDto == null)
                {
                    _logger.LogWarning("SprintPlan with ID {SprintId} not found.", sprintId);
                    return NotFound($"SprintPlan with ID {sprintId} not found.");
                }

                _logger.LogInformation("SprintPlan with ID {SprintId} found.", sprintId);
                return Ok(sprintPlanDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving single SprintPlan with ID: {SprintId}.", sprintId);
                return StatusCode(500, new { message = "An unexpected error occurred.", details = ex.Message });
            }
        }

        /// <summary>
        /// Updates an existing SprintPlan based on its SprintId.
        /// </summary>
        /// <param name="sprintPlanDto">The SprintPlan data to update.</param>
        /// <returns>A status indicating success or failure of the update operation.</returns>
        [HttpPut("single-sprint-plan")]
        [ProducesResponseType(200)]
        [ProducesResponseType(400)]
        [ProducesResponseType(404)]
        [ProducesResponseType(500)]
        public async Task<IActionResult> UpdateSingleSprintPlan([FromBody] SprintPlanDto sprintPlanDto)
        {
            if (!ModelState.IsValid)
            {
                _logger.LogWarning("Invalid ModelState for UpdateSingleSprintPlan: {@ModelState}", ModelState);
                return BadRequest(ModelState);
            }

            try
            {
                var command = new UpdateSingleSprintPlanCommand { SprintPlan = sprintPlanDto };
                var success = await _mediator.Send(command);

                if (success)
                {
                    _logger.LogInformation("SprintPlan with ID {SprintId} updated successfully.", sprintPlanDto.SprintId);
                    return Ok(new { message = $"SprintPlan with ID {sprintPlanDto.SprintId} updated successfully." });
                }
                else
                {
                    _logger.LogWarning("SprintPlan with ID {SprintId} not found for update or no changes were made.", sprintPlanDto.SprintId);
                    return NotFound(new { message = $"SprintPlan with ID {sprintPlanDto.SprintId} not found or no changes were made." });
                }
            }
            catch (ArgumentException ex)
            {
                _logger.LogError(ex, "Validation error updating single SprintPlan: {Message}", ex.Message);
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating single SprintPlan with ID: {SprintId}.", sprintPlanDto.SprintId);
                return StatusCode(500, new { message = "An unexpected error occurred.", details = ex.Message });
            }
        }

        /// <summary>
        /// Creates a single SprintTask entry, optionally with associated subtasks.
        /// </summary>
        /// <param name="sprintTaskDto">The SprintTask data to create.</param>
        /// <returns>The TaskId of the newly created SprintTask.</returns>
        [HttpPost("single-sprint-task")]
        [ProducesResponseType(typeof(string), 201)]
        [ProducesResponseType(400)]
        [ProducesResponseType(500)]
        public async Task<IActionResult> CreateSingleSprintTask([FromBody] SprintTaskDto sprintTaskDto)
        {
            if (!ModelState.IsValid)
            {
                _logger.LogWarning("Invalid ModelState for CreateSingleSprintTask: {@ModelState}", ModelState);
                return BadRequest(ModelState);
            }

            try
            {
                var command = new CreateSprintTaskCommand { SprintTask = sprintTaskDto };
                var taskId = await _mediator.Send(command);

                _logger.LogInformation("Single SprintTask created successfully with ID: {TaskId}", taskId);
                return CreatedAtAction(nameof(GetSingleSprintTask), new { taskId = taskId }, new { taskId = taskId, message = $"SprintTask with ID {taskId} created successfully." });
            }
            catch (ArgumentException ex)
            {
                _logger.LogError(ex, "Validation error creating single SprintTask: {Message}", ex.Message);
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating single SprintTask.");
                return StatusCode(500, new { message = "An unexpected error occurred.", details = ex.Message });
            }
        }

        /// <summary>
        /// Updates an existing SprintTask based on its TaskId, optionally updating associated subtasks.
        /// </summary>
        /// <param name="sprintTaskDto">The SprintTask data to update.</param>
        /// <returns>A status indicating success or failure of the update operation.</returns>
        [HttpPut("single-sprint-task")]
        [ProducesResponseType(200)]
        [ProducesResponseType(400)]
        [ProducesResponseType(404)]
        [ProducesResponseType(500)]
        public async Task<IActionResult> UpdateSingleSprintTask([FromBody] SprintTaskDto sprintTaskDto)
        {
            if (!ModelState.IsValid)
            {
                _logger.LogWarning("Invalid ModelState for UpdateSingleSprintTask: {@ModelState}", ModelState);
                return BadRequest(ModelState);
            }

            try
            {
                var command = new UpdateSprintTaskCommand { SprintTask = sprintTaskDto };
                var success = await _mediator.Send(command);

                if (success)
                {
                    _logger.LogInformation("SprintTask with ID {TaskId} updated successfully.", sprintTaskDto.Taskid);
                    return Ok(new { message = $"SprintTask with ID {sprintTaskDto.Taskid} updated successfully." });
                }
                else
                {
                    _logger.LogWarning("SprintTask with ID {TaskId} not found for update or no changes were made.", sprintTaskDto.Taskid);
                    return NotFound(new { message = $"SprintTask with ID {sprintTaskDto.Taskid} not found or no changes were made." });
                }
            }
            catch (ArgumentException ex)
            {
                _logger.LogError(ex, "Validation error updating single SprintTask: {Message}", ex.Message);
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating single SprintTask with ID: {TaskId}.", sprintTaskDto.Taskid);
                return StatusCode(500, new { message = "An unexpected error occurred.", details = ex.Message });
            }
        }

        /// <summary>
        /// Gets a single SprintTask by its ID.
        /// </summary>
        /// <param name="taskId">The ID of the SprintTask.</param>
        /// <returns>The SprintTask data.</returns>
        [HttpGet("single-sprint-task/{taskId}")]
        [ProducesResponseType(typeof(SprintTaskDto), 200)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> GetSingleSprintTask(string taskId)
        {
            _logger.LogInformation("Attempting to retrieve single SprintTask with ID: {TaskId}", taskId);

            try
            {
                var query = new GetSingleSprintTaskQuery { TaskId = taskId };
                var sprintTaskDto = await _mediator.Send(query);

                if (sprintTaskDto == null)
                {
                    _logger.LogWarning("SprintTask with ID {TaskId} not found.", taskId);
                    return NotFound($"SprintTask with ID {taskId} not found.");
                }

                _logger.LogInformation("SprintTask with ID {TaskId} found.", taskId);
                return Ok(sprintTaskDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving single SprintTask with ID: {TaskId}.", taskId);
                return StatusCode(500, new { message = "An unexpected error occurred.", details = ex.Message });
            }
        }

        /// <summary>
        /// Deletes a SprintTask by its TaskId, including all associated subtasks.
        /// </summary>
        /// <param name="taskId">The ID of the SprintTask to delete.</param>
        /// <returns>A status indicating success or failure of the deletion operation.</returns>
        [HttpDelete("single-sprint-task/{taskId}")]
        [ProducesResponseType(200)]
        [ProducesResponseType(400)]
        [ProducesResponseType(404)]
        [ProducesResponseType(500)]
        public async Task<IActionResult> DeleteSingleSprintTask(string taskId)
        {
            if (string.IsNullOrWhiteSpace(taskId))
            {
                _logger.LogWarning("TaskId is null or empty for DeleteSingleSprintTask request.");
                return BadRequest(new { message = "TaskId cannot be null or empty." });
            }

            try
            {
                var command = new DeleteSprintTaskCommand { TaskId = taskId };
                var success = await _mediator.Send(command);

                if (success)
                {
                    _logger.LogInformation("SprintTask with ID {TaskId} and its subtasks deleted successfully.", taskId);
                    return Ok(new { message = $"SprintTask with ID {taskId} and its subtasks deleted successfully." });
                }
                else
                {
                    _logger.LogWarning("SprintTask with ID {TaskId} not found for deletion or no changes were made.", taskId);
                    return NotFound(new { message = $"SprintTask with ID {taskId} not found or no changes were made." });
                }
            }
            catch (ArgumentException ex)
            {
                _logger.LogError(ex, "Validation error deleting single SprintTask: {Message}", ex.Message);
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting single SprintTask with ID: {TaskId}.", taskId);
                return StatusCode(500, new { message = "An unexpected error occurred.", details = ex.Message });
            }
        }

        /// <summary>
        /// Creates a single SprintSubtask entry for a given SprintTask.
        /// </summary>
        /// <param name="sprintSubtaskDto">The SprintSubtask data to create.</param>
        /// <returns>The SubtaskId of the newly created SprintSubtask.</returns>
        [HttpPost("single-sprint-subtask")]
        [ProducesResponseType(typeof(int), 201)]
        [ProducesResponseType(400)]
        [ProducesResponseType(500)]
        public async Task<IActionResult> CreateSingleSprintSubtask([FromBody] SprintSubtaskDto sprintSubtaskDto)
        {
            if (!ModelState.IsValid)
            {
                _logger.LogWarning("Invalid ModelState for CreateSingleSprintSubtask: {@ModelState}", ModelState);
                return BadRequest(ModelState);
            }

            try
            {
                var command = new CreateSprintSubtaskCommand { SprintSubtask = sprintSubtaskDto };
                var subtaskId = await _mediator.Send(command);

                _logger.LogInformation("Single SprintSubtask created successfully with ID: {SubtaskId}", subtaskId);
                // Assuming a GetSingleSprintSubtask endpoint will be created later if needed
                return StatusCode(201, new { subtaskId = subtaskId, message = $"SprintSubtask with ID {subtaskId} created successfully." });
            }
            catch (ArgumentException ex)
            {
                _logger.LogError(ex, "Validation error creating single SprintSubtask: {Message}", ex.Message);
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating single SprintSubtask.");
                return StatusCode(500, new { message = "An unexpected error occurred.", details = ex.Message });
            }
        }

        /// <summary>
        /// Deletes a SprintSubtask by its SubtaskId.
        /// </summary>
        /// <param name="subtaskId">The ID of the SprintSubtask to delete.</param>
        /// <returns>A status indicating success or failure of the deletion operation.</returns>
        [HttpDelete("single-sprint-subtask/{subtaskId}")]
        [ProducesResponseType(200)]
        [ProducesResponseType(400)]
        [ProducesResponseType(404)]
        [ProducesResponseType(500)]
        public async Task<IActionResult> DeleteSingleSprintSubtask(int subtaskId)
        {
            if (subtaskId <= 0)
            {
                _logger.LogWarning("SubtaskId is invalid for DeleteSingleSprintSubtask request.");
                return BadRequest(new { message = "SubtaskId cannot be invalid." });
            }

            try
            {
                var command = new DeleteSprintSubtaskCommand { SubtaskId = subtaskId };
                var success = await _mediator.Send(command);

                if (success)
                {
                    _logger.LogInformation("SprintSubtask with ID {SubtaskId} deleted successfully.", subtaskId);
                    return Ok(new { message = $"SprintSubtask with ID {subtaskId} deleted successfully." });
                }
                else
                {
                    _logger.LogWarning("SprintSubtask with ID {SubtaskId} not found for deletion or no changes were made.", subtaskId);
                    return NotFound(new { message = $"SprintSubtask with ID {subtaskId} not found or no changes were made." });
                }
            }
            catch (ArgumentException ex)
            {
                _logger.LogError(ex, "Validation error deleting single SprintSubtask: {Message}", ex.Message);
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting single SprintSubtask with ID: {SubtaskId}.", subtaskId);
                return StatusCode(500, new { message = "An unexpected error occurred.", details = ex.Message });
            }
        }

        /// <summary>
        /// Gets a single SprintSubtask by its ID.
        /// </summary>
        /// <param name="subtaskId">The ID of the SprintSubtask.</param>
        /// <returns>The SprintSubtask data.</returns>
        [HttpGet("single-sprint-subtask/{subtaskId}")]
        [ProducesResponseType(typeof(SprintSubtaskDto), 200)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> GetSingleSprintSubtask(int subtaskId)
        {
            _logger.LogInformation("Attempting to retrieve single SprintSubtask with ID: {SubtaskId}", subtaskId);

            try
            {
                var query = new GetSingleSprintSubtaskQuery { SubtaskId = subtaskId };
                var sprintSubtaskDto = await _mediator.Send(query);

                if (sprintSubtaskDto == null)
                {
                    _logger.LogWarning("SprintSubtask with ID {SubtaskId} not found.", subtaskId);
                    return NotFound($"SprintSubtask with ID {subtaskId} not found.");
                }

                _logger.LogInformation("SprintSubtask with ID {SubtaskId} found.", subtaskId);
                return Ok(sprintSubtaskDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving single SprintSubtask with ID: {SubtaskId}.", subtaskId);
                return StatusCode(500, new { message = "An unexpected error occurred.", details = ex.Message });
            }
        }

        /// <summary>
        /// Gets all SprintTasks for a specific Project ID, returning only summary fields.
        /// </summary>
        /// <param name="projectId">The ID of the Project.</param>
        /// <returns>A list of SprintTaskSummaryDto.</returns>
        [HttpGet("project/{projectId}/sprint-tasks-summary")]
        [ProducesResponseType(typeof(IEnumerable<SprintTaskSummaryDto>), 200)]
        [ProducesResponseType(404)]
        [ProducesResponseType(500)]
        public async Task<IActionResult> GetAllSprintTasksByProjectId(int projectId)
        {
            _logger.LogInformation("Attempting to retrieve SprintTasks summary for Project ID: {ProjectId}", projectId);

            try
            {
                var query = new GetAllSprintTasksByProjectIdQuery { ProjectId = projectId };
                var sprintTasks = await _mediator.Send(query);

                if (sprintTasks == null || !sprintTasks.Any())
                {
                    _logger.LogWarning("No SprintTasks found for Project ID {ProjectId}.", projectId);
                    return NotFound($"No SprintTasks found for Project ID {projectId}.");
                }

                _logger.LogInformation("Found {Count} SprintTasks for Project ID {ProjectId}.", sprintTasks.Count(), projectId);
                return Ok(sprintTasks);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving SprintTasks for Project ID: {ProjectId}.", projectId);
                return StatusCode(500, new { message = "An unexpected error occurred.", details = ex.Message });
            }
        }

        /// <summary>
        /// Gets all SprintSubtasks for a specific Task ID.
        /// </summary>
        /// <param name="taskId">The ID of the parent SprintTask.</param>
        /// <returns>A list of SprintSubtaskDto.</returns>
        [HttpGet("task/{taskId}/sprint-subtasks")]
        [ProducesResponseType(typeof(IEnumerable<SprintSubtaskDto>), 200)]
        [ProducesResponseType(404)]
        [ProducesResponseType(500)]
        public async Task<IActionResult> GetAllSprintSubtasksByTaskId(string taskId)
        {
            _logger.LogInformation("Attempting to retrieve SprintSubtasks for Task ID: {TaskId}", taskId);

            try
            {
                var query = new GetAllSprintSubtasksByTaskIdQuery { TaskId = taskId };
                var sprintSubtasks = await _mediator.Send(query);

                if (sprintSubtasks == null || !sprintSubtasks.Any())
                {
                    _logger.LogWarning("No SprintSubtasks found for Task ID {TaskId}.", taskId);
                    return NotFound($"No SprintSubtasks found for Task ID {taskId}.");
                }

                _logger.LogInformation("Found {Count} SprintSubtasks for Task ID {TaskId}.", sprintSubtasks.Count(), taskId);
                return Ok(sprintSubtasks);
            }
            catch (ArgumentException ex)
            {
                _logger.LogError(ex, "Validation error retrieving SprintSubtasks by Task ID: {Message}", ex.Message);
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving SprintSubtasks for Task ID: {TaskId}.", taskId);
                return StatusCode(500, new { message = "An unexpected error occurred.", details = ex.Message });
            }
        }
    }
}

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
using Swashbuckle.AspNetCore.Filters;
using NJSAPI.Examples;
using NJS.Application.CQRS.SprintSubtasks.Commands; // Added for SprintSubtaskComment commands
using NJS.Application.CQRS.SprintSubtasks.Queries; // Added for SprintSubtaskComment queries
using NJS.Application.Dtos; // Ensure this is included for SprintSubtaskCommentDto

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
        /// Creates a new SprintSubtask for a given SprintTask.
        /// </summary>
        /// <param name="taskId">The ID of the parent SprintTask.</param>
        /// <param name="subtaskDto">The subtask data to create.</param>
        /// <returns>The created SprintSubtask.</returns>
        [HttpPost("{taskId}/subtasks")]
        [ProducesResponseType(typeof(SprintSubtaskDto), 201)]
        [ProducesResponseType(400)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> CreateSprintSubtask(int taskId, [FromBody] SprintSubtaskDto subtaskDto)
        {
            if (taskId != subtaskDto.Taskid)
            {
                return BadRequest("Task ID in the route does not match Task ID in the body.");
            }

            var command = new CreateSprintSubtaskCommand { SprintSubtask = subtaskDto };
            var subtask = await _mediator.Send(command);
            return CreatedAtAction(nameof(CreateSprintSubtask), new { taskId = taskId, subtaskId = subtask }, subtask);
        }

        /// <summary>
        /// Updates an existing SprintSubtask.
        /// </summary>
        /// <param name="subtaskId">The ID of the subtask to update.</param>
        /// <param name="subtaskDto">The subtask data to update.</param>
        /// <returns>The updated SprintSubtask.</returns>
        [HttpPut("subtasks/{subtaskId}")]
        [ProducesResponseType(typeof(SprintSubtaskDto), 200)]
        [ProducesResponseType(400)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> UpdateSprintSubtask(int subtaskId, [FromBody] SprintSubtaskDto subtaskDto)
        {
            if (subtaskId != subtaskDto.SubtaskId)
            {
                return BadRequest("Subtask ID in the route does not match Subtask ID in the body.");
            }

            var command = new UpdateSprintSubtaskCommand { SubtaskId = subtaskId, SprintSubtask = subtaskDto, TaskId = subtaskDto.Taskid };
            await _mediator.Send(command);
            return Ok(subtaskDto); // Return the updated DTO for a user-friendly response
        }

        /// <summary>
        /// Deletes a SprintSubtask by its SubtaskId.
        /// </summary>
        /// <param name="subtaskId">The ID of the SprintSubtask to delete.</param>
        /// <returns>A status indicating success or failure of the deletion operation.</returns>
        [HttpDelete("subtasks/{subtaskId}")]
        [ProducesResponseType(204)]
        [ProducesResponseType(400)]
        [ProducesResponseType(404)]
        [ProducesResponseType(500)]
        public async Task<IActionResult> DeleteSprintSubtask(int subtaskId)
        {
            if (subtaskId <= 0)
            {
                _logger.LogWarning("SubtaskId is invalid for DeleteSprintSubtask request.");
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
                _logger.LogError(ex, "Validation error deleting SprintSubtask: {Message}", ex.Message);
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting SprintSubtask with ID: {SubtaskId}.", subtaskId);
                return StatusCode(500, new { message = "An unexpected error occurred.", details = ex.Message });
            }
        }

        /// <summary>
        /// Gets a single SprintSubtask by its ID.
        /// </summary>
        /// <param name="subtaskId">The ID of the SprintSubtask.</param>
        /// <returns>The SprintSubtask data.</returns>
        [HttpGet("subtasks/{subtaskId}")]
        [ProducesResponseType(typeof(SprintSubtaskDto), 200)]
        [ProducesResponseType(404)]
        [ProducesResponseType(500)]
        public async Task<IActionResult> GetSprintSubtaskById(int subtaskId)
        {
            _logger.LogInformation("Attempting to retrieve SprintSubtask with ID: {SubtaskId}", subtaskId);

            try
            {
                var query = new GetSprintSubtaskByIdQuery { SubtaskId = subtaskId };
                var subtaskDto = await _mediator.Send(query);

                if (subtaskDto == null)
                {
                    _logger.LogWarning("SprintSubtask with ID {SubtaskId} not found.", subtaskId);
                    return NotFound($"SprintSubtask with ID {subtaskId} not found.");
                }

                _logger.LogInformation("SprintSubtask with ID {SubtaskId} found.", subtaskId);
                return Ok(subtaskDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving SprintSubtask with ID: {SubtaskId}.", subtaskId);
                return StatusCode(500, new { message = "An unexpected error occurred.", details = ex.Message });
            }
        }

        /// <summary>
        /// Deletes a SprintSubtask by its SubtaskId.
        /// </summary>
        /// <param name="sprintPlanDto">The SprintPlan data to create.</param>
        /// <returns>The ID of the newly created SprintPlan.</returns>
        [HttpPost("single-sprint-plan")]
        [ProducesResponseType(typeof(int), 201)]
        [ProducesResponseType(400)]
        [ProducesResponseType(500)]
        [SwaggerRequestExample(typeof(SprintPlanInputDto), typeof(SprintPlanInputDtoExample))]
        public async Task<IActionResult> CreateSingleSprintPlan([FromBody] SprintPlanInputDto sprintPlanInputDto)
        {
            if (!ModelState.IsValid)
            {
                _logger.LogWarning("Invalid ModelState for CreateSingleSprintPlan: {@ModelState}", ModelState);
                return BadRequest(ModelState);
            }

            try
            {
                var command = new CreateSingleSprintPlanCommand { SprintPlan = sprintPlanInputDto };
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
        [SwaggerRequestExample(typeof(SprintPlanInputDto), typeof(SprintPlanInputDtoExample))]
        public async Task<IActionResult> UpdateSingleSprintPlan([FromBody] SprintPlanInputDto sprintPlanInputDto)
        {
            if (!ModelState.IsValid)
            {
                _logger.LogWarning("Invalid ModelState for UpdateSingleSprintPlan: {@ModelState}", ModelState);
                return BadRequest(ModelState);
            }

            try
            {
                var command = new UpdateSingleSprintPlanCommand { SprintPlan = sprintPlanInputDto };
                var success = await _mediator.Send(command);

                if (success)
                {
                    _logger.LogInformation("SprintPlan with ID {SprintId} updated successfully.", sprintPlanInputDto.SprintId);
                    return Ok(new { message = $"SprintPlan with ID {sprintPlanInputDto.SprintId} updated successfully." });
                }
                else
                {
                    _logger.LogWarning("SprintPlan with ID {SprintId} not found for update or no changes were made.", sprintPlanInputDto.SprintId);
                    return NotFound(new { message = $"SprintPlan with ID {sprintPlanInputDto.SprintId} not found or no changes were made." });
                }
            }
            catch (ArgumentException ex)
            {
                _logger.LogError(ex, "Validation error updating single SprintPlan: {Message}", ex.Message);
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating single SprintPlan with ID: {SprintId}.", sprintPlanInputDto.SprintId);
                return StatusCode(500, new { message = "An unexpected error occurred.", details = ex.Message });
            }
        }

        /// <summary>
        /// Creates a single SprintTask entry, optionally with associated subtasks.
        /// </summary>
        /// <param name="sprintTaskDto">The SprintTask data to create.</param>
        /// <returns>The TaskId of the newly created SprintTask.</returns>
        [HttpPost("single-sprint-task")]
        [ProducesResponseType(typeof(int), 201)]
        [ProducesResponseType(400)]
        [ProducesResponseType(500)]
        [SwaggerRequestExample(typeof(SprintTaskInputDto), typeof(SprintTaskInputDtoExample))]
        public async Task<IActionResult> CreateSingleSprintTask([FromBody] SprintTaskInputDto sprintTaskInputDto)
        {
            if (!ModelState.IsValid)
            {
                _logger.LogWarning("Invalid ModelState for CreateSingleSprintTask: {@ModelState}", ModelState);
                return BadRequest(ModelState);
            }

            try
            {
                var command = new CreateSprintTaskCommand { SprintTask = sprintTaskInputDto };
                var taskId = await _mediator.Send(command);

                _logger.LogInformation("Single SprintTask created successfully with ID: {TaskId}", taskId);
                return CreatedAtAction(null, new { taskId = taskId }, new { taskId = taskId, message = $"SprintTask with ID {taskId} created successfully." });
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
        /// Gets a single SprintTask by its ID.
        /// </summary>
        /// <param name="taskId">The ID of the SprintTask.</param>
        /// <returns>The SprintTask data.</returns>
        [HttpGet("{taskId}")]
        [ProducesResponseType(typeof(SprintTaskDto), 200)]
        [ProducesResponseType(404)]
        [ProducesResponseType(500)]
        public async Task<IActionResult> GetSingleSprintTask(int taskId)
        {
            _logger.LogInformation("Attempting to retrieve SprintTask with ID: {TaskId}", taskId);

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
                _logger.LogError(ex, "Error retrieving SprintTask with ID: {TaskId}.", taskId);
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
        [SwaggerRequestExample(typeof(SprintTaskInputDto), typeof(SprintTaskInputDtoExample))]
        public async Task<IActionResult> UpdateSingleSprintTask([FromBody] SprintTaskInputDto sprintTaskInputDto)
        {
            if (!ModelState.IsValid)
            {
                _logger.LogWarning("Invalid ModelState for UpdateSingleSprintTask: {@ModelState}", ModelState);
                return BadRequest(ModelState);
            }

            try
            {
                var command = new UpdateSprintTaskCommand { SprintTask = sprintTaskInputDto };
                var success = await _mediator.Send(command);

                if (success)
                {
                    _logger.LogInformation("SprintTask with ID {TaskId} updated successfully.", sprintTaskInputDto.Taskid);
                    return Ok(new { message = $"SprintTask with ID {sprintTaskInputDto.Taskid} updated successfully." });
                }
                else
                {
                    _logger.LogWarning("SprintTask with ID {TaskId} not found for update or no changes were made.", sprintTaskInputDto.Taskid);
                    return NotFound(new { message = $"SprintTask with ID {sprintTaskInputDto.Taskid} not found or no changes were made." });
                }
            }
            catch (ArgumentException ex)
            {
                _logger.LogError(ex, "Validation error updating single SprintTask: {Message}", ex.Message);
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating single SprintTask with ID: {TaskId}.", sprintTaskInputDto.Taskid);
                return StatusCode(500, new { message = "An unexpected error occurred.", details = ex.Message });
            }
        }

        /// <summary>
        /// Gets all subtasks for a specific SprintTask.
        /// </summary>
        /// <param name="taskId">The ID of the parent SprintTask.</param>
        /// <returns>A list of SprintSubtaskDto.</returns>
        [HttpGet("{taskId}/subtasks")]
        [ProducesResponseType(typeof(IEnumerable<SprintSubtaskDto>), 200)]
        [ProducesResponseType(404)]
        [ProducesResponseType(500)]
        public async Task<IActionResult> GetAllSprintSubtasksByTaskId(int taskId)
        {
            _logger.LogInformation("Attempting to retrieve all SprintSubtasks for Task ID: {TaskId}", taskId);

            try
            {
                var query = new GetAllSprintSubtasksByTaskIdQuery { TaskId = taskId };
                var subtasks = await _mediator.Send(query);

                if (subtasks == null || !subtasks.Any())
                {
                    _logger.LogWarning("No SprintSubtasks found for Task ID {TaskId}.", taskId);
                    return NotFound($"No SprintSubtasks found for Task ID {taskId}.");
                }

                _logger.LogInformation("Found {Count} SprintSubtasks for Task ID {TaskId}.", subtasks.Count(), taskId);
                return Ok(subtasks);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving SprintSubtasks for Task ID: {TaskId}.", taskId);
                return StatusCode(500, new { message = "An unexpected error occurred.", details = ex.Message });
            }
        }

        /// <summary>
        /// Gets all sprint tasks for a specific Project ID, returning a summary of each task.
        /// </summary>
        /// <param name="projectId">The ID of the Project.</param>
        /// <returns>A list of SprintTaskSummaryDto.</returns>
        [HttpGet("project/{projectId}/tasks")]
        [ProducesResponseType(typeof(IEnumerable<SprintTaskSummaryDto>), 200)]
        [ProducesResponseType(404)]
        [ProducesResponseType(500)]
        public async Task<IActionResult> GetSprintTasksByProjectId(int projectId)
        {
            _logger.LogInformation("Attempting to retrieve SprintTasks for Project ID: {ProjectId}", projectId);

            try
            {
                var query = new GetSprintTasksByProjectIdQuery { ProjectId = projectId };
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
        /// Deletes a SprintTask by its TaskId, including all associated subtasks.
        /// </summary>
        /// <param name="taskId">The ID of the SprintTask to delete.</param>
        /// <returns>A status indicating success or failure of the deletion operation.</returns>
        [HttpDelete("{taskId}")]
        [ProducesResponseType(204)]
        [ProducesResponseType(400)]
        [ProducesResponseType(404)]
        [ProducesResponseType(500)]
        public async Task<IActionResult> DeleteSprintTask(int taskId)
        {
            if (taskId <= 0)
            {
                _logger.LogWarning("TaskId is invalid for DeleteSprintTask request.");
                return BadRequest(new { message = "TaskId cannot be invalid." });
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
                _logger.LogError(ex, "Validation error deleting SprintTask: {Message}", ex.Message);
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting SprintTask with ID: {TaskId}.", taskId);
                return StatusCode(500, new { message = "An unexpected error occurred.", details = ex.Message });
            }
        }


        /// <summary>
        /// Gets all comments for a specific SprintTask.
        /// </summary>
        /// <param name="taskId">The ID of the parent SprintTask.</param>
        /// <returns>A list of SprintTaskCommentDto.</returns>
        [HttpGet("{taskId}/comments")]
        [ProducesResponseType(typeof(IEnumerable<SprintTaskCommentDto>), 200)]
        [ProducesResponseType(404)]
        [ProducesResponseType(500)]
        public async Task<IActionResult> GetSprintTaskCommentsByTaskId(int taskId)
        {
            _logger.LogInformation("Attempting to retrieve SprintTask comments for Task ID: {TaskId}", taskId);

            try
            {
                var query = new GetSprintTaskCommentsByTaskIdQuery { Taskid = taskId };
                var comments = await _mediator.Send(query);

                if (comments == null || !comments.Any())
                {
                    _logger.LogWarning("No SprintTask comments found for Task ID {TaskId}.", taskId);
                    return NotFound($"No SprintTask comments found for Task ID {taskId}.");
                }

                _logger.LogInformation("Found {Count} SprintTask comments for Task ID {TaskId}.", comments.Count(), taskId);
                return Ok(comments);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving SprintTask comments for Task ID: {TaskId}.", taskId);
                return StatusCode(500, new { message = "An unexpected error occurred.", details = ex.Message });
            }
        }

        /// <summary>
        /// Gets a single SprintTask comment by its ID.
        /// </summary>
        /// <param name="commentId">The ID of the SprintTask comment.</param>
        /// <returns>The SprintTaskComment data.</returns>
        [HttpGet("comments/{commentId}")]
        [ProducesResponseType(typeof(SprintTaskCommentDto), 200)]
        [ProducesResponseType(404)]
        [ProducesResponseType(500)]
        public async Task<IActionResult> GetSprintTaskCommentById(int commentId)
        {
            _logger.LogInformation("Attempting to retrieve SprintTask comment with ID: {CommentId}", commentId);

            try
            {
                var query = new GetSprintTaskCommentByIdQuery { CommentId = commentId };
                var comment = await _mediator.Send(query);

                if (comment == null)
                {
                    _logger.LogWarning("SprintTask comment with ID {CommentId} not found.", commentId);
                    return NotFound($"SprintTask comment with ID {commentId} not found.");
                }

                _logger.LogInformation("SprintTask comment with ID {CommentId} found.", commentId);
                return Ok(comment);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving SprintTask comment with ID: {CommentId}.", commentId);
                return StatusCode(500, new { message = "An unexpected error occurred.", details = ex.Message });
            }
        }

        /// <summary>
        /// Creates a new comment for a specific SprintTask.
        /// </summary>
        /// <param name="taskId">The ID of the parent SprintTask.</param>
        /// <param name="commentDto">The SprintTaskComment data to create.</param>
        /// <returns>A status indicating success or failure of the creation operation.</returns>
        [HttpPost("{taskId}/comments")]
        [ProducesResponseType(201)]
        [ProducesResponseType(400)]
        [ProducesResponseType(404)]
        [ProducesResponseType(500)]
        public async Task<IActionResult> AddSprintTaskComment(int taskId, [FromBody] AddSprintTaskCommentCommand commentDto)
        {
            if (!ModelState.IsValid)
            {
                _logger.LogWarning("Invalid ModelState for AddSprintTaskComment: {@ModelState}", ModelState);
                return BadRequest(ModelState);
            }

            try
            {
                commentDto.TaskId = taskId; // Set TaskId from route
                var success = await _mediator.Send(commentDto);

                if (success)
                {
                    _logger.LogInformation("Comment added successfully to SprintTask with ID: {TaskId}", taskId);
                    return StatusCode(201, new { message = $"Comment added successfully to SprintTask with ID {taskId}." });
                }
                else
                {
                    _logger.LogWarning("SprintTask with ID {TaskId} not found for adding comment.", taskId);
                    return NotFound(new { message = $"SprintTask with ID {taskId} not found." });
                }
            }
            catch (ArgumentException ex)
            {
                _logger.LogError(ex, "Validation error adding SprintTask comment: {Message}", ex.Message);
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding SprintTask comment to Task ID: {TaskId}.", taskId);
                return StatusCode(500, new { message = "An unexpected error occurred.", details = ex.Message });
            }
        }

        /// <summary>
        /// Updates an existing comment for a specific SprintTask.
        /// </summary>
        /// <param name="taskId">The ID of the parent SprintTask.</param>
        /// <param name="commentId">The ID of the comment to update.</param>
        /// <param name="commentDto">The SprintTaskComment data to update.</param>
        /// <returns>A status indicating success or failure of the update operation.</returns>
        [HttpPut("{taskId}/comments/{commentId}")]
        [ProducesResponseType(200)]
        [ProducesResponseType(400)]
        [ProducesResponseType(404)]
        [ProducesResponseType(500)]
        public async Task<IActionResult> UpdateSprintTaskComment(int taskId, int commentId, [FromBody] UpdateSprintTaskCommentCommand commentDto)
        {
            if (!ModelState.IsValid)
            {
                _logger.LogWarning("Invalid ModelState for UpdateSprintTaskComment: {@ModelState}", ModelState);
                return BadRequest(ModelState);
            }

            try
            {
                commentDto.Taskid = taskId; // Set Taskid from route
                commentDto.CommentId = commentId; // Set CommentId from route
                var success = await _mediator.Send(commentDto);

                if (success)
                {
                    _logger.LogInformation("Comment with ID {CommentId} for Task ID {TaskId} updated successfully.", commentId, taskId);
                    return Ok(new { message = $"Comment with ID {commentId} for Task ID {taskId} updated successfully." });
                }
                else
                {
                    _logger.LogWarning("Comment with ID {CommentId} for Task ID {TaskId} not found for update or no changes were made.", commentId, taskId);
                    return NotFound(new { message = $"Comment with ID {commentId} for Task ID {taskId} not found or no changes were made." });
                }
            }
            catch (ArgumentException ex)
            {
                _logger.LogError(ex, "Validation error updating SprintTask comment: {Message}", ex.Message);
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating SprintTask comment with ID: {CommentId} for Task ID: {TaskId}.", commentId, taskId);
                return StatusCode(500, new { message = "An unexpected error occurred.", details = ex.Message });
            }
        }

        /// <summary>
        /// Deletes a SprintTask comment by its ID.
        /// </summary>
        /// <param name="commentId">The ID of the comment to delete.</param>
        /// <returns>A status indicating success or failure of the deletion operation.</returns>
        [HttpDelete("comments/{commentId}")]
        [ProducesResponseType(200)]
        [ProducesResponseType(400)]
        [ProducesResponseType(404)]
        [ProducesResponseType(500)]
        public async Task<IActionResult> DeleteSprintTaskComment(int commentId)
        {
            if (commentId <= 0)
            {
                _logger.LogWarning("CommentId is invalid for DeleteSprintTaskComment request.");
                return BadRequest(new { message = "CommentId cannot be invalid." });
            }

            try
            {
                var command = new DeleteSprintTaskCommentCommand { CommentId = commentId };
                var success = await _mediator.Send(command);

                if (success)
                {
                    _logger.LogInformation("SprintTask comment with ID {CommentId} deleted successfully.", commentId);
                    return Ok(new { message = $"SprintTask comment with ID {commentId} deleted successfully." });
                }
                else
                {
                    _logger.LogWarning("SprintTask comment with ID {CommentId} not found for deletion or no changes were made.", commentId);
                    return NotFound(new { message = $"SprintTask comment with ID {commentId} not found or no changes were made." });
                }
            }
            catch (ArgumentException ex)
            {
                _logger.LogError(ex, "Validation error deleting SprintTask comment: {Message}", ex.Message);
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting SprintTask comment with ID: {CommentId}.", commentId);
                return StatusCode(500, new { message = "An unexpected error occurred.", details = ex.Message });
            }
        }

        /// <summary>
        /// Gets all comments for a specific SprintSubtask.
        /// </summary>
        /// <param name="subtaskId">The ID of the parent SprintSubtask.</param>
        /// <returns>A list of SprintSubtaskCommentDto.</returns>
        [HttpGet("{taskId}/subtasks/{subtaskId}/comments")]
        [ProducesResponseType(typeof(IEnumerable<SprintSubtaskCommentDto>), 200)]
        [ProducesResponseType(404)]
        [ProducesResponseType(500)]
        public async Task<IActionResult> GetSprintSubtaskCommentsBySubtaskId(int taskId, int subtaskId)
        {
            _logger.LogInformation("Attempting to retrieve SprintSubtask comments for Task ID: {TaskId}, Subtask ID: {SubtaskId}", taskId, subtaskId);

            try
            {
                var query = new GetSprintSubtaskCommentsBySubtaskIdQuery { SubtaskId = subtaskId };
                var comments = await _mediator.Send(query);

                if (comments == null || !comments.Any())
                {
                    _logger.LogWarning("No SprintSubtask comments found for Subtask ID {SubtaskId}.", subtaskId);
                    return NotFound($"No SprintSubtask comments found for Subtask ID {subtaskId}.");
                }

                _logger.LogInformation("Found {Count} SprintSubtask comments for Subtask ID {SubtaskId}.", comments.Count(), subtaskId);
                return Ok(comments);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving SprintSubtask comments for Subtask ID: {SubtaskId}.", subtaskId);
                return StatusCode(500, new { message = "An unexpected error occurred.", details = ex.Message });
            }
        }

        /// <summary>
        /// Gets a single SprintSubtask comment by its ID.
        /// </summary>
        /// <param name="subtaskCommentId">The ID of the SprintSubtask comment.</param>
        /// <returns>The SprintSubtaskComment data.</returns>
        [HttpGet("subtask-comments/{subtaskCommentId}")]
        [ProducesResponseType(typeof(SprintSubtaskCommentDto), 200)]
        [ProducesResponseType(404)]
        [ProducesResponseType(500)]
        public async Task<IActionResult> GetSprintSubtaskCommentById(int subtaskCommentId)
        {
            _logger.LogInformation("Attempting to retrieve SprintSubtask comment with ID: {SubtaskCommentId}", subtaskCommentId);

            try
            {
                var query = new GetSprintSubtaskCommentByIdQuery { SubtaskCommentId = subtaskCommentId };
                var comment = await _mediator.Send(query);

                if (comment == null)
                {
                    _logger.LogWarning("SprintSubtask comment with ID {SubtaskCommentId} not found.", subtaskCommentId);
                    return NotFound($"SprintSubtask comment with ID {subtaskCommentId} not found.");
                }

                _logger.LogInformation("SprintSubtask comment with ID {SubtaskCommentId} found.", subtaskCommentId);
                return Ok(comment);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving SprintSubtask comment with ID: {SubtaskCommentId}.", subtaskCommentId);
                return StatusCode(500, new { message = "An unexpected error occurred.", details = ex.Message });
            }
        }

        /// <summary>
        /// Creates a new comment for a specific SprintSubtask.
        /// </summary>
        /// <param name="taskId">The ID of the parent SprintTask.</param>
        /// <param name="subtaskId">The ID of the parent SprintSubtask.</param>
        /// <param name="commentDto">The SprintSubtaskComment data to create.</param>
        /// <returns>A status indicating success or failure of the creation operation.</returns>
        [HttpPost("{taskId}/subtasks/{subtaskId}/comments")]
        [ProducesResponseType(201)]
        [ProducesResponseType(400)]
        [ProducesResponseType(404)]
        [ProducesResponseType(500)]
        public async Task<IActionResult> AddSprintSubtaskComment(int taskId, int subtaskId, [FromBody] AddSprintSubtaskCommentCommand commentDto)
        {
            if (!ModelState.IsValid)
            {
                _logger.LogWarning("Invalid ModelState for AddSprintSubtaskComment: {@ModelState}", ModelState);
                return BadRequest(ModelState);
            }

            try
            {
                commentDto.Taskid = taskId; // Set Taskid from route
                commentDto.SubtaskId = subtaskId; // Set SubtaskId from route
                var success = await _mediator.Send(commentDto);

                if (success)
                {
                    _logger.LogInformation("Comment added successfully to SprintSubtask with ID: {SubtaskId} under Task ID: {TaskId}", subtaskId, taskId);
                    return StatusCode(201, new { message = $"Comment added successfully to SprintSubtask with ID {subtaskId} under Task ID {taskId}." });
                }
                else
                {
                    _logger.LogWarning("SprintSubtask with ID {SubtaskId} or Task ID {TaskId} not found for adding comment.", subtaskId, taskId);
                    return NotFound(new { message = $"SprintSubtask with ID {subtaskId} or Task ID {taskId} not found." });
                }
            }
            catch (ArgumentException ex)
            {
                _logger.LogError(ex, "Validation error adding SprintSubtask comment: {Message}", ex.Message);
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding SprintSubtask comment to Subtask ID: {SubtaskId} under Task ID: {TaskId}.", subtaskId, taskId);
                return StatusCode(500, new { message = "An unexpected error occurred.", details = ex.Message });
            }
        }

        /// <summary>
        /// Updates an existing comment for a specific SprintSubtask.
        /// </summary>
        /// <param name="taskId">The ID of the parent SprintTask.</param>
        /// <param name="subtaskId">The ID of the parent SprintSubtask.</param>
        /// <param name="subtaskCommentId">The ID of the comment to update.</param>
        /// <param name="commentDto">The SprintSubtaskComment data to update.</param>
        /// <returns>A status indicating success or failure of the update operation.</returns>
        [HttpPut("{taskId}/subtasks/{subtaskId}/comments/{subtaskCommentId}")]
        [ProducesResponseType(200)]
        [ProducesResponseType(400)]
        [ProducesResponseType(404)]
        [ProducesResponseType(500)]
        public async Task<IActionResult> UpdateSprintSubtaskComment(int taskId, int subtaskId, int subtaskCommentId, [FromBody] UpdateSprintSubtaskCommentCommand commentDto)
        {
            if (!ModelState.IsValid)
            {
                _logger.LogWarning("Invalid ModelState for UpdateSprintSubtaskComment: {@ModelState}", ModelState);
                return BadRequest(ModelState);
            }

            try
            {
                commentDto.Taskid = taskId; // Set Taskid from route
                commentDto.SubtaskId = subtaskId; // Set SubtaskId from route
                commentDto.SubtaskCommentId = subtaskCommentId; // Set SubtaskCommentId from route
                var success = await _mediator.Send(commentDto);

                if (success)
                {
                    _logger.LogInformation("Comment with ID {SubtaskCommentId} for Subtask ID {SubtaskId} under Task ID {TaskId} updated successfully.", subtaskCommentId, subtaskId, taskId);
                    return Ok(new { message = $"Comment with ID {subtaskCommentId} for Subtask ID {subtaskId} under Task ID {taskId} updated successfully." });
                }
                else
                {
                    _logger.LogWarning("Comment with ID {SubtaskCommentId} for Subtask ID {SubtaskId} under Task ID {TaskId} not found for update or no changes were made.", subtaskCommentId, subtaskId, taskId);
                    return NotFound(new { message = $"Comment with ID {subtaskCommentId} for Subtask ID {subtaskId} under Task ID {taskId} not found or no changes were made." });
                }
            }
            catch (ArgumentException ex)
            {
                _logger.LogError(ex, "Validation error updating SprintSubtask comment: {Message}", ex.Message);
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating SprintSubtask comment with ID: {SubtaskCommentId} for Subtask ID: {SubtaskId} under Task ID: {TaskId}.", subtaskCommentId, subtaskId, taskId);
                return StatusCode(500, new { message = "An unexpected error occurred.", details = ex.Message });
            }
        }

        /// <summary>
        /// Deletes a SprintSubtask comment by its ID.
        /// </summary>
        /// <param name="subtaskCommentId">The ID of the comment to delete.</param>
        /// <returns>A status indicating success or failure of the deletion operation.</returns>
        [HttpDelete("subtask-comments/{subtaskCommentId}")]
        [ProducesResponseType(200)]
        [ProducesResponseType(400)]
        [ProducesResponseType(404)]
        [ProducesResponseType(500)]
        public async Task<IActionResult> DeleteSprintSubtaskComment(int subtaskCommentId)
        {
            if (subtaskCommentId <= 0)
            {
                _logger.LogWarning("SubtaskCommentId is invalid for DeleteSprintSubtaskComment request.");
                return BadRequest(new { message = "SubtaskCommentId cannot be invalid." });
            }

            try
            {
                var command = new DeleteSprintSubtaskCommentCommand { SubtaskCommentId = subtaskCommentId };
                var success = await _mediator.Send(command);

                if (success)
                {
                    _logger.LogInformation("SprintSubtask comment with ID {SubtaskCommentId} deleted successfully.", subtaskCommentId);
                    return Ok(new { message = $"SprintSubtask comment with ID {subtaskCommentId} deleted successfully." });
                }
                else
                {
                    _logger.LogWarning("SprintSubtask comment with ID {SubtaskCommentId} not found for deletion or no changes were made.", subtaskCommentId);
                    return NotFound(new { message = $"SprintSubtask comment with ID {subtaskCommentId} not found or no changes were made." });
                }
            }
            catch (ArgumentException ex)
            {
                _logger.LogError(ex, "Validation error deleting SprintSubtask comment: {Message}", ex.Message);
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting SprintSubtask comment with ID: {SubtaskCommentId}.", subtaskCommentId);
                return StatusCode(500, new { message = "An unexpected error occurred.", details = ex.Message });
            }
        }
    }
}

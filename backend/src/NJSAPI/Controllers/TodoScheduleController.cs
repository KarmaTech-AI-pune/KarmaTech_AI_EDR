using MediatR;
using Microsoft.AspNetCore.Mvc;
using NJS.Application.CQRS.ProjectSchedules.Command;
using NJS.Application.CQRS.ProjectSchedules.Query;
using NJS.Application.Dtos;
using System.Threading.Tasks;
using System;
using Microsoft.Extensions.Logging; // Added for ILogger
using NJS.Application.CQRS.SprintPlans.Commands; // Added for CreateSingleSprintPlanCommand
using NJS.Application.CQRS.SprintPlans.Queries; // Added for GetSingleSprintPlanQuery
using Microsoft.AspNetCore.Authorization; // Assuming authorization is needed

namespace NJSAPI.Controllers
{
    [ApiController]
    [Route("api/project-schedule")]
    [Authorize] // Apply authorization if needed
    public class TodoScheduleController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly ILogger<TodoScheduleController> _logger; // Inject ILogger

        public TodoScheduleController(IMediator mediator, ILogger<TodoScheduleController> logger)
        {
            _mediator = mediator ?? throw new ArgumentNullException(nameof(mediator));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        /// <summary>
        /// Creates a project schedule including multiple sprint plans, tasks, and subtasks.
        /// </summary>
        /// <param name="todoScheduleDto">The project schedule data.</param>
        /// <returns>The ID of the created project.</returns>
        [HttpPost]
        [ProducesResponseType(typeof(int), 201)]
        [ProducesResponseType(400)]
        [ProducesResponseType(500)]
        public async Task<IActionResult> CreateTodoSchedule([FromBody] ProjectScheduleDto todoScheduleDto)
        {
            if (!ModelState.IsValid)
            {
                _logger.LogWarning("Invalid ModelState for CreateTodoSchedule: {@ModelState}", ModelState);
                return BadRequest(ModelState);
            }

            try
            {
                var command = new CreateProjectScheduleCommand { ProjectSchedule = todoScheduleDto };
                var createdProjectId = await _mediator.Send(command);

                var accessLink = $"{Request.Scheme}://{Request.Host}/api/project-schedule/{createdProjectId}";

                var response = new ProjectScheduleResponseDto
                {
                    Data = todoScheduleDto?.SprintPlans?.FirstOrDefault(),
                    AccessLink = accessLink,
                    ProjectId = createdProjectId,
                    Message = "Project schedule(s) created successfully!"
                };

                _logger.LogInformation("Project schedule(s) created successfully for Project ID: {ProjectId}", createdProjectId);
                return CreatedAtAction(nameof(GetTodoSchedule), new { projectId = createdProjectId }, response);
            }
            catch (ArgumentException ex)
            {
                _logger.LogError(ex, "Validation error creating project schedule: {Message}", ex.Message);
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating project schedule.");
                return StatusCode(500, new { message = "An unexpected error occurred.", details = ex.Message });
            }
        }

        /// <summary>
        /// Gets a project schedule by Project ID, including all associated sprint plans, tasks, and subtasks.
        /// </summary>
        /// <param name="projectId">The ID of the project.</param>
        /// <returns>The full project schedule data.</returns>
        [HttpGet("{projectId}")]
        [ProducesResponseType(typeof(ProjectScheduleDto), 200)]
        [ProducesResponseType(404)]
        public async Task<ActionResult<ProjectScheduleDto>> GetTodoSchedule(int projectId)
        {
            _logger.LogInformation("Attempting to retrieve Project Schedule for Project ID: {ProjectId}", projectId);
            try
            {
                var query = new GetProjectScheduleQuery { ProjectId = projectId };
                var todoSchedule = await _mediator.Send(query);

                if (todoSchedule == null)
                {
                    _logger.LogWarning("Project Schedule for Project ID {ProjectId} not found.", projectId);
                    return NotFound($"Project Schedule for Project ID {projectId} not found.");
                }

                _logger.LogInformation("Project Schedule for Project ID {ProjectId} found.", projectId);
                return Ok(todoSchedule);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving Project Schedule for Project ID: {ProjectId}.", projectId);
                return StatusCode(500, new { message = "An unexpected error occurred.", details = ex.Message });
            }
        }

    }
}

using MediatR;
using Microsoft.AspNetCore.Mvc;
using NJS.Application.CQRS.Projects.Commands;
using NJS.Application.CQRS.Projects.Queries;
using NJS.Application.Dtos;
using NJS.Application.Services.IContract;
using NJS.Domain.Entities;
using System;
using System.Threading.Tasks;

namespace NJSAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProjectController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly IProjectManagementService _projectManagementService;
        private readonly ILogger<ProjectController> _logger;

        public ProjectController(IMediator mediator, IProjectManagementService projectManagementService, ILogger<ProjectController> logger)
        {
            _mediator = mediator ?? throw new ArgumentNullException(nameof(mediator));
            _projectManagementService = projectManagementService ?? throw new ArgumentNullException(nameof(projectManagementService));
            _logger = logger;
        }

        /// <summary>
        /// Creates a new project
        /// </summary>
        [HttpPost]
        [ProducesResponseType(typeof(int), 201)]
        [ProducesResponseType(400)]
        [ProducesResponseType(500)]
        public async Task<IActionResult> Create([FromBody] ProjectDto projectData)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var command = new CreateProjectCommand(projectData);
                var projectId = await _mediator.Send(command);
                return CreatedAtAction(nameof(GetById), new { id = projectId }, projectId);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        /// <summary>
        /// Gets a project by ID
        /// </summary>
        [HttpGet("{id}")]
        [ProducesResponseType(typeof(Project), 200)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> GetById(int id)
        {
            var query = new GetProjectByIdQuery { Id = id };
            var result = await _mediator.Send(query);

            if (result == null)
                return NotFound();

            return Ok(result);
        }

        /// <summary>
        /// Gets projects by UserId
        /// </summary>
        [HttpGet("getByUserId/{userId}")]
        [ProducesResponseType(typeof(Project), 200)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> GetByUserId(string userId)
        {
            var query = new GetProjectByUserIdQuery { UserId = userId };
            var result = await _mediator.Send(query);

            if (result == null)
                return NotFound();

            return Ok(result);
        }

        /// <summary>
        /// Gets all projects
        /// </summary>
        [HttpGet]
        [ProducesResponseType(typeof(Project[]), 200)]
        public async Task<IActionResult> GetAll()
        {
            var query = new GetAllProjectsQuery();
            var result = await _mediator.Send(query);
            return Ok(result);
        }

        /// <summary>
        /// Updates an existing project
        /// </summary>
        [HttpPut("{id}")]
        [ProducesResponseType(204)]
        [ProducesResponseType(400)]
        [ProducesResponseType(404)]
        [ProducesResponseType(500)]
        public async Task<IActionResult> Update(int id, [FromBody] ProjectDto projectData)
        {
            // Log the update request
            projectData.Office = projectData.Office ?? string.Empty;
            projectData.TypeOfJob = projectData.TypeOfJob ?? string.Empty;
            projectData.Priority = projectData.Priority ?? string.Empty;
            projectData.FeeType = projectData.FeeType ?? string.Empty;
            projectData.Region = projectData.Region ?? string.Empty;

            if (id != projectData.Id)
            {
               _logger.LogWarning($"ID mismatch: URL ID {id} != DTO ID {projectData.Id}");
                return BadRequest("ID mismatch");
            }

            if (!ModelState.IsValid)
            {
                _logger.LogWarning($"Invalid model state: {string.Join(", ", ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage))}");
                return BadRequest(ModelState);
            }

            try
            {
                var command = new UpdateProjectCommand
                {
                    Id = id,
                    ProjectDto = projectData
                };
                await _mediator.Send(command);

                // Log success

                // Return the updated project data
                var updatedProject = await _mediator.Send(new GetProjectByIdQuery { Id = id });
                return Ok(updatedProject);
            }
            catch (ArgumentException ex) // Project not found
            {
                _logger.LogError(ex,$"Project not found error: {ex.Message}");
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error updating project:: {ex.Message}");

                return StatusCode(500, new { message = ex.Message });
            }
        }

        /// <summary>
        /// Deletes a project
        /// </summary>
        [HttpDelete("{id}")]
        [ProducesResponseType(typeof(object), 200)]
        [ProducesResponseType(500)]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {

                try
                {
                    await _mediator.Send(new DeleteProjectCommand { Id = id });
                    // Log success
                    return Ok(new { success = true, message = $"Project with ID {id} deleted successfully" });
                }
                catch (ArgumentException ex) // Project not found
                {
                    _logger.LogError(ex,$"Project not found, but returning success: {ex.Message}");
                    // Return success even if project doesn't exist
                    return Ok(new { success = true, message = $"Project with ID {id} deleted successfully" });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex,$"Error deleting project: {ex.Message}");
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// Creates a feasibility study for a project
        /// </summary>
        [HttpPost("{id}/feasibility-study")]
        [ProducesResponseType(typeof(int), 201)]
        [ProducesResponseType(400)]
        [ProducesResponseType(404)]
        [ProducesResponseType(500)]
        public async Task<IActionResult> CreateFeasibilityStudy(int id, [FromBody] CreateFeasibilityStudyCommand command)
        {
            if (command == null)
                return BadRequest();

            command.ProjectId = id;

            try
            {
                var feasibilityStudyId = await _mediator.Send(command);
                return CreatedAtAction(nameof(GetFeasibilityStudy), new { id = id }, feasibilityStudyId);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        /// <summary>
        /// Gets a project's feasibility study
        /// </summary>
        [HttpGet("{id}/feasibility-study")]
        [ProducesResponseType(typeof(FeasibilityStudy), 200)]
        [ProducesResponseType(404)]
        public IActionResult GetFeasibilityStudy(int id)
        {
            var feasibilityStudy = _projectManagementService.GetFeasibilityStudy(id);
            if (feasibilityStudy == null)
                return NotFound();

            return Ok(feasibilityStudy);
        }
    }
}

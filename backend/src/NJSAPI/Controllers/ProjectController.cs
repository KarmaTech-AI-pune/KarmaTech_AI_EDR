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

        public ProjectController(IMediator mediator, IProjectManagementService projectManagementService)
        {
            _mediator = mediator ?? throw new ArgumentNullException(nameof(mediator));
            _projectManagementService = projectManagementService ?? throw new ArgumentNullException(nameof(projectManagementService));
        }

        /// <summary>
        /// Creates a new project
        /// </summary>
        [HttpPost]
        [ProducesResponseType(typeof(int), 201)]
        [ProducesResponseType(400)]
        [ProducesResponseType(500)]
        public async Task<IActionResult> Create([FromBody] ProjectDto projectDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var command = new CreateProjectCommand(projectDto);
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
        public async Task<IActionResult> Update(int id, [FromBody] ProjectDto projectDto)
        {
            if (id != projectDto.Id)
                return BadRequest("ID mismatch");

            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var command = new UpdateProjectCommand
                {
                    Id = id,
                    ProjectDto = projectDto
                };
                await _mediator.Send(command);
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        /// <summary>
        /// Deletes a project
        /// </summary>
        [HttpDelete("{id}")]
        [ProducesResponseType(204)]
        [ProducesResponseType(404)]
        [ProducesResponseType(500)]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                await _mediator.Send(new DeleteProjectCommand { Id = id });
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
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

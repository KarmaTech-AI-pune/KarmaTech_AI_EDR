using MediatR;
using Microsoft.AspNetCore.Mvc;
using NJS.Application.CQRS.ProjectSchedules.Command;
using NJS.Application.CQRS.ProjectSchedules.Query;
using NJS.Application.Dtos;
using System.Threading.Tasks;
using System;

namespace NJSAPI.Controllers
{
    [ApiController]
    [Route("api/project-schedule")]
    public class TodoScheduleController : ControllerBase
    {
        private readonly IMediator _mediator;

        public TodoScheduleController(IMediator mediator)
        {
            _mediator = mediator ?? throw new ArgumentNullException(nameof(mediator));
        }

        [HttpPost]
        public async Task<IActionResult> CreateTodoSchedule([FromBody] ProjectScheduleDto todoScheduleDto)
        {
            var command = new CreateProjectScheduleCommand { ProjectSchedule = todoScheduleDto };
            var createdProjectId = await _mediator.Send(command);

            // The createdId is the ProjectId from the handler.
            // We need to ensure the SprintPlanDto within the response has the correct ProjectId.
            if (todoScheduleDto?.SprintPlan != null)
            {
                todoScheduleDto.SprintPlan.ProjectId = createdProjectId;
            }

            // Generate the access link
            var accessLink = $"{Request.Scheme}://{Request.Host}/api/project-schedule/{createdProjectId}";

            // Return 200 OK with the SprintPlan data and access link
            var response = new ProjectScheduleResponseDto
            {
                Data = todoScheduleDto?.SprintPlan,  // Return the SprintPlanDto
                AccessLink = accessLink,
                ProjectId = createdProjectId
            };

            return Ok(response);
        }


        [HttpGet("{projectId}")]
        public async Task<ActionResult<ProjectScheduleDto>> GetTodoSchedule(int projectId)
        {
            var query = new GetProjectScheduleQuery { ProjectId = projectId };
            var todoSchedule = await _mediator.Send(query);

            if (todoSchedule == null)
            {
                return NotFound();
            }

            return Ok(todoSchedule);
        }
    }
}

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
            var createdProjectId = await _mediator.Send(command); // This will now return the ProjectId for the first sprint plan, or a generic ID if multiple are created.

            // Generate the access link (might need adjustment if multiple project IDs are created)
            var accessLink = $"{Request.Scheme}://{Request.Host}/api/project-schedule/{createdProjectId}";

            // Return 200 OK with the list of SprintPlan data and access link
            var response = new ProjectScheduleResponseDto
            {
                Data = todoScheduleDto?.SprintPlans?.FirstOrDefault(), // Return the first SprintPlanDto for now, or adjust response DTO
                AccessLink = accessLink,
                ProjectId = createdProjectId,
                Message = "Project schedule(s) created successfully!"
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

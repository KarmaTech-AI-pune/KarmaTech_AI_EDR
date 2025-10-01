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
            var createdId = await _mediator.Send(command);

            // Set the ProjectId on the input DTO
            todoScheduleDto.ProjectId = createdId;

            // Generate the access link
            var accessLink = $"{Request.Scheme}://{Request.Host}/api/project-schedule/{createdId}";

            // Return 200 OK with the input data and access link
            var response = new ProjectScheduleResponseDto
            {
                Data = todoScheduleDto,  // Return the input DTO with the created ProjectId
                AccessLink = accessLink,
                ProjectId = createdId
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

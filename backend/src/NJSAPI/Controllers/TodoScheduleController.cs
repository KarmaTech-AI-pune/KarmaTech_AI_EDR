using MediatR;
using Microsoft.AspNetCore.Mvc;
using NJS.Application.CQRS.TodoSchedules.Command;
using NJS.Application.CQRS.TodoSchedules.Query;
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
        public async Task<IActionResult> CreateTodoSchedule([FromBody] TodoScheduleDto todoScheduleDto)
        {
            var command = new CreateTodoScheduleCommand { TodoSchedule = todoScheduleDto };
            var createdId = await _mediator.Send(command);

            // Fetch the newly created schedule with all its details
            var query = new GetTodoScheduleQuery { ProjectId = createdId };
            var storedData = await _mediator.Send(query);

            if (storedData == null)
            {
                return StatusCode(500, "Failed to retrieve created schedule.");
            }

            // Generate the access link
            var accessLink = $"{Request.Scheme}://{Request.Host}/api/project-schedule/{createdId}";

            // Return 200 OK with the full stored data and access link
            var response = new TodoScheduleResponseDto
            {
                Data = storedData,
                AccessLink = accessLink,
                ProjectId = createdId
            };

            return Ok(response);
        }

        [HttpGet("{projectId}")]
        public async Task<IActionResult> GetTodoSchedule(int projectId)
        {
            var query = new GetTodoScheduleQuery { ProjectId = projectId };
            var todoSchedule = await _mediator.Send(query);

            if (todoSchedule == null)
            {
                return NotFound();
            }

            return Ok(todoSchedule);
        }
    }
}

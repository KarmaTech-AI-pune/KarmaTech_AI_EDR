using MediatR;
using Microsoft.AspNetCore.Mvc;
using NJS.Application.CQRS.TodoSchedules.Command;
using NJS.Application.CQRS.TodoSchedules.Query;
using NJS.Application.Dtos;
using System.Threading.Tasks;

namespace NJSAPI.Controllers
{
    [ApiController]
    [Route("api/todoschedule")]
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

            // Prefer provided ProjectID for lookup; fall back to created id
            //var lookupProjectId = todoScheduleDto?.ProjectID ?? createdId;
            //var query = new GetTodoScheduleQuery { ProjectId = lookupProjectId };
            //var stored = await _mediator.Send(query);

            // Return 200 OK with the stored data (if not found, at least return the id)
            //object response = stored as object ?? new { id = createdId };
            return Ok(todoScheduleDto);
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

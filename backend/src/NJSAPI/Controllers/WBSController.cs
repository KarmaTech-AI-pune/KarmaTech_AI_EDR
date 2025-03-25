using MediatR;
using Microsoft.AspNetCore.Mvc;
using NJS.Application.Dtos;
using NJS.Application.CQRS.WorkBreakdownStructures.Commands;
using NJS.Application.CQRS.WorkBreakdownStructures.Queries;

namespace NJSAPI.Controllers
{
    [Route("api/projects/{projectId}/[controller]")]
    [ApiController]
    public class WBSController : ControllerBase
    {
        private readonly IMediator _mediator;

        public WBSController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet]
        public async Task<ActionResult<WBSDetailsDto>> GetWBS(int projectId)
        {
            var result = await _mediator.Send(new GetWBSQuery(projectId));
            return Ok(result);
        }

        [HttpPost]
        public async Task<ActionResult<int>> CreateWBS(int projectId)
        {
            var result = await _mediator.Send(new CreateWBSCommand(projectId));
            return CreatedAtAction(nameof(GetWBS), new { projectId }, result);
        }

        [HttpPost("tasks")]
        public async Task<ActionResult<int>> AddTask(int projectId, CreateWBSTaskCommand command)
        {
            command.ProjectId = projectId;
            var result = await _mediator.Send(command);
            return CreatedAtAction(nameof(GetWBS), new { projectId }, result);
        }

        [HttpPut("tasks/{taskId}")]
        public async Task<IActionResult> UpdateTask(int taskId, UpdateWBSTaskCommand command)
        {
            if (taskId != command.TaskId)
                return BadRequest("Task ID mismatch");

            await _mediator.Send(command);
            return NoContent();
        }

        [HttpDelete("tasks/{taskId}")]
        public async Task<IActionResult> DeleteTask(int taskId)
        {
            await _mediator.Send(new DeleteWBSTaskCommand(taskId));
            return NoContent();
        }

        [HttpGet("tasks/hierarchy")]
        public async Task<ActionResult<List<WBSTaskHierarchyDto>>> GetTaskHierarchy(int projectId)
        {
            var result = await _mediator.Send(new GetWBSTaskHierarchyQuery(projectId));
            return Ok(result);
        }
    }
}

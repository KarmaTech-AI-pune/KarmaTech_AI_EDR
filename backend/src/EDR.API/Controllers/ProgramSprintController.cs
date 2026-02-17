using MediatR;
using Microsoft.AspNetCore.Mvc;
using EDR.Application.CQRS.SprintWbsPlans.Commands;
using EDR.Application.CQRS.SprintWbsPlans.Queries;
using EDR.Application.Dtos;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace EDR.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProgramSprintController : ControllerBase
    {
        private readonly IMediator _mediator;

        public ProgramSprintController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpPost("bulk")]
        public async Task<IActionResult> BulkCreate([FromBody] List<CreateSprintWbsPlanDto> items)
        {
            var command = new BulkCreateSprintWbsPlanCommand { Items = items };
            var result = await _mediator.Send(command);
            return Ok(result);
        }

        [HttpGet("{projectId}")]
        public async Task<ActionResult<List<EDR.Domain.Entities.SprintWbsPlan>>> Get(int projectId)
        {
            var result = await _mediator.Send(new GetSprintWbsPlansByProjectQuery(projectId));
            return Ok(result);
        }

        [HttpGet("{projectId}/current")]
        public async Task<ActionResult<CurrentSprintWbsPlanResponseDto>> GetCurrent(int projectId)
        {
            var result = await _mediator.Send(new GetCurrentSprintWbsPlanQuery(projectId));
            
            if (result == null)
            {
                return NoContent();
            }

            return Ok(result);
        }
    }
}


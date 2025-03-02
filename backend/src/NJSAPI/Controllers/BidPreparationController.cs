using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NJS.Application.CQRS.Commands.BidPreparation;
using NJS.Application.CQRS.Queries.BidPreparation;
using NJS.Application.Dtos;

namespace NJSAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    
    public class BidPreparationController : ControllerBase
    {
        private readonly IMediator _mediator;

        public BidPreparationController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet]
        public async Task<ActionResult<BidPreparationDto>> Get()
        {
            var userId = User.Identity.Name; 
            var query = new GetBidPreparationQuery { UserId = userId };
            var result = await _mediator.Send(query);

            if (result == null)
            {
                return NotFound();
            }

            return Ok(result);
        }

        [HttpPut]
        public async Task<ActionResult<bool>> Update([FromBody] UpdateBidPreparationCommand command)
        {
            command.UserId = User.Identity.Name;
            var result = await _mediator.Send(command);

            if (!result)
            {
                return BadRequest("Failed to update bid preparation data");
            }

            return Ok(result);
        }
    }
}

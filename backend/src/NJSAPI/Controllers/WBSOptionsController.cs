using MediatR;
using Microsoft.AspNetCore.Mvc;
using NJS.Application.CQRS.WorkBreakdownStructures.Queries;
using NJS.Application.Dtos;
using System.Threading.Tasks;

namespace NJSAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class WBSOptionsController : ControllerBase
    {
        private readonly IMediator _mediator;

        public WBSOptionsController(IMediator mediator)
        {
            _mediator = mediator;
        }

        /// <summary>
        /// Retrieves all WBS options organized by levels
        /// </summary>
        /// <returns>WBS options categorized by level 1, 2, and 3</returns>
        [HttpGet]
        [ProducesResponseType(typeof(WBSLevelOptionsDto), 200)]
        public async Task<ActionResult<WBSLevelOptionsDto>> GetWBSOptions()
        {
            var query = new GetWBSOptionsQuery();
            var result = await _mediator.Send(query);
            return Ok(result);
        }
    }
}

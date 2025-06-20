using MediatR;
using Microsoft.AspNetCore.Mvc;
using NJS.Application.CQRS.WorkBreakdownStructures.Queries;
using NJS.Application.Dtos;
using NJS.Domain.Entities;

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
        /// <param name="formType">Optional form type filter (0 = Manpower, 1 = ODC)</param>
        /// <returns>WBS options categorized by level 1, 2, and 3</returns>
        [HttpGet]
        [ProducesResponseType(typeof(WBSLevelOptionsDto), 200)]
        public async Task<ActionResult<WBSLevelOptionsDto>> GetWBSOptions([FromQuery] FormType? formType = null)
        {
            var query = new GetWBSOptionsQuery { FormType = formType };
            var result = await _mediator.Send(query);
            return Ok(result);
        }

        /// <summary>
        /// Retrieves all level 1 WBS options
        /// </summary>
        /// <param name="formType">Optional form type filter (0 = Manpower, 1 = ODC)</param>
        /// <returns>List of level 1 WBS options</returns>
        [HttpGet("level1")]
        [ProducesResponseType(typeof(List<WBSOptionDto>), 200)]
        public async Task<ActionResult<List<WBSOptionDto>>> GetLevel1Options([FromQuery] FormType? formType = null)
        {
            var query = new GetWBSLevel1OptionsQuery { FormType = formType };
            var result = await _mediator.Send(query);
            return Ok(result);
        }

        /// <summary>
        /// Retrieves all level 2 WBS options
        /// </summary>
        /// <param name="formType">Optional form type filter (0 = Manpower, 1 = ODC)</param>
        /// <returns>List of level 2 WBS options</returns>
        [HttpGet("level2")]
        [ProducesResponseType(typeof(List<WBSOptionDto>), 200)]
        public async Task<ActionResult<List<WBSOptionDto>>> GetLevel2Options([FromQuery] FormType? formType = null)
        {
            var query = new GetWBSLevel2OptionsQuery { FormType = formType };
            var result = await _mediator.Send(query);
            return Ok(result);
        }

        /// <summary>
        /// Retrieves level 3 WBS options for a specific level 2 value
        /// </summary>
        /// <param name="level2Value">The level 2 value to get level 3 options for</param>
        /// <param name="formType">Optional form type filter (0 = Manpower, 1 = ODC)</param>
        /// <returns>List of level 3 WBS options for the specified level 2 value</returns>
        [HttpGet("level3/{level2Value}")]
        [ProducesResponseType(typeof(List<WBSOptionDto>), 200)]
        public async Task<ActionResult<List<WBSOptionDto>>> GetLevel3Options(string level2Value, [FromQuery] FormType? formType = null)
        {
            var query = new GetWBSLevel3OptionsQuery { Level2Value = level2Value, FormType = formType };
            var result = await _mediator.Send(query);
            return Ok(result);
        }
    }
}

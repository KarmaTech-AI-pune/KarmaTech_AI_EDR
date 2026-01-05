using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NJS.Application.CQRS.WorkBreakdownStructures.Queries;
using NJS.Application.Dtos;
using NJS.Domain.Entities;
using NJS.Application.CQRS.WorkBreakdownStructures.Commands;

namespace NJSAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
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
        /// Retrieves all level 2 WBS options for a given level 1 parent
        /// </summary>
        /// <param name="level1Id">The ID of the level 1 parent option</param>
        /// <param name="formType">Optional form type filter (0 = Manpower, 1 = ODC)</param>
        /// <returns>List of level 2 WBS options</returns>
        [HttpGet("level2")]
        [ProducesResponseType(typeof(List<WBSOptionDto>), 200)]
        public async Task<ActionResult<List<WBSOptionDto>>> GetLevel2Options([FromQuery] int level1Id, [FromQuery] FormType? formType = null)
        {
            var query = new GetWBSLevel2OptionsQuery { Level1Id = level1Id, FormType = formType };
            var result = await _mediator.Send(query);
            return Ok(result);
        }

        /// <summary>
        /// Retrieves level 3 WBS options for a specific level 2 parent
        /// </summary>
        /// <param name="level2Id">The ID of the level 2 parent option</param>
        /// <param name="formType">Optional form type filter (0 = Manpower, 1 = ODC)</param>
        /// <returns>List of level 3 WBS options for the specified level 2 parent</returns>
        [HttpGet("level3")]
        [ProducesResponseType(typeof(List<WBSOptionDto>), 200)]
        public async Task<ActionResult<List<WBSOptionDto>>> GetLevel3Options([FromQuery] int level2Id,
            [FromQuery] FormType? formType = null)
        {
            var query = new GetWBSLevel3OptionsQuery { Level2Id = level2Id, FormType = formType };
            var result = await _mediator.Send(query);
            return Ok(result);
        }

        [HttpPost]
        public async Task<ActionResult<List<WBSOptionDto>>> CreateWBSOption(List<WBSOptionDto> requests)
        {
            var command = new CreateWBSOptionCommand
            {
                Options = requests
            };

            var result = await _mediator.Send(command);
            return Ok(result);
        }

        [HttpPut]
        public async Task<ActionResult<List<WBSOptionDto>>> UpdateWBSOptions(List<WBSOptionDto> requests)
        {
            var command = new UpdateWBSOptionCommand
            {
                Options = requests
            };

            var result = await _mediator.Send(command);

            return Ok(result);
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult<bool>> DeleteWBSOption(int id)
        {
            try
            {
                var command = new DeleteWBSOptionCommand { Id = id };
                var result = await _mediator.Send(command);

                if (!result)
                {
                    return NotFound();
                }

                return NoContent();
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}

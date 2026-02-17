using MediatR;
using Microsoft.AspNetCore.Mvc;
using EDR.Application.CQRS.Feature.Commands;
using EDR.Application.CQRS.Feature.Queries;

namespace EDR.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FeatureController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly ILogger<FeatureController> _logger;

        public FeatureController(IMediator mediator, ILogger<FeatureController> logger)
        {
            _mediator = mediator;
            _logger = logger;
        }

        [HttpPost]
        public async Task<IActionResult> CreateFeature([FromBody] CreateFeatureCommand command)
        {
            try
            {
                var feature = await _mediator.Send(command);
                if (feature == null)
                {
                    return BadRequest("Feature creation failed.");
                }

                return CreatedAtAction(nameof(GetAllFeatures), new { id = feature.Id }, feature);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating feature.");
                return StatusCode(500, "Internal server error.");
            }
        }

        [HttpGet]
        public async Task<IActionResult> GetAllFeatures()
        {
            try
            {
                var features = await _mediator.Send(new GetAllFeaturesQuery());
                return Ok(features);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all features.");
                return StatusCode(500, "Internal server error.");
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetFeatureById(int id)
        {
            try
            {
                var query = new GetFeatureByIdQuery(id);
                var feature = await _mediator.Send(query);
                if (feature == null)
                {
                    return NotFound();
                }
                return Ok(feature);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting feature by id: {id}");
                return StatusCode(500, "Internal server error.");
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateFeature(int id, [FromBody] UpdateFeatureCommand command)
        {
            if (id != command.Id)
            {
                return BadRequest("Feature ID mismatch");
            }

            try
            {
                var feature = await _mediator.Send(command);
                if (feature == null)
                {
                    return NotFound();
                }
                return Ok(feature);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error updating feature: {id}");
                return StatusCode(500, "Internal server error.");
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteFeature(int id)
        {
            try
            {
                var command = new DeleteFeatureCommand(id);
                var result = await _mediator.Send(command);

                if (!result)
                {
                    return NotFound();
                }

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error deleting feature: {id}");
                return StatusCode(500, "Internal server error.");
            }
        }
    }
}


using MediatR;
using Microsoft.AspNetCore.Mvc;
using NJS.Application.CQRS.Feature.Commands;
using NJS.Application.CQRS.Feature.Queries;

namespace NJSAPI.Controllers
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
    }
}

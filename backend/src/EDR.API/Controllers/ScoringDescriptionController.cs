using Microsoft.AspNetCore.Mvc;
using EDR.Application.Services;

namespace EDR.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ScoringDescriptionController : ControllerBase
    {
        private readonly IScoringDescriptionService _scoringDescriptionService;

        public ScoringDescriptionController(IScoringDescriptionService scoringDescriptionService)
        {
            _scoringDescriptionService = scoringDescriptionService;
        }

        [HttpGet]
        public async Task<IActionResult> GetScoringDescriptions()
        {
            try
            {
                var result = await _scoringDescriptionService.GetScoringDescriptionsAsync();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}


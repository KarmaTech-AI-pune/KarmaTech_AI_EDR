using Microsoft.AspNetCore.Mvc;
using NJS.Application.Interfaces;
using NJS.Domain.Entities;

namespace NJSAPI.Controllers
{
    [ApiController]
    [Route("api/opportunity-tracking")]
    public class OpportunityTrackingController : ControllerBase
    {
        private readonly IOpportunityTrackingRepository _opportunityTrackingRepository;

        public OpportunityTrackingController(IOpportunityTrackingRepository opportunityTrackingRepository)
        {
            _opportunityTrackingRepository = opportunityTrackingRepository;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var opportunities = await _opportunityTrackingRepository.GetAllAsync();
            return Ok(opportunities);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var opportunity = await _opportunityTrackingRepository.GetByIdAsync(id);
            if (opportunity == null)
            {
                return NotFound();
            }
            return Ok(opportunity);
        }

        [HttpGet("project/{projectId}")]
        public async Task<IActionResult> GetByProjectId(int projectId)
        {
            var opportunities = await _opportunityTrackingRepository.GetByProjectIdAsync(projectId);
            return Ok(opportunities);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] OpportunityTracking opportunityTracking)
        {
            if (opportunityTracking == null)
            {
                return BadRequest();
            }

            try
            {
                // Set audit fields
                opportunityTracking.CreatedAt = DateTime.UtcNow;
                
                var result = await _opportunityTrackingRepository.AddAsync(opportunityTracking);
                return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] OpportunityTracking opportunityTracking)
        {
            if (opportunityTracking == null || id != opportunityTracking.Id)
            {
                return BadRequest();
            }

            try
            {
                var existing = await _opportunityTrackingRepository.GetByIdAsync(id);
                if (existing == null)
                {
                    return NotFound();
                }

                // Update audit fields
                opportunityTracking.LastModifiedAt = DateTime.UtcNow;
                
                await _opportunityTrackingRepository.UpdateAsync(opportunityTracking);
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var opportunity = await _opportunityTrackingRepository.GetByIdAsync(id);
            if (opportunity == null)
            {
                return NotFound();
            }

            await _opportunityTrackingRepository.DeleteAsync(id);
            return NoContent();
        }
    }
}

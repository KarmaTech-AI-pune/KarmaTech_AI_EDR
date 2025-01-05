using Microsoft.AspNetCore.Mvc;
using MediatR;
using NJS.Application.CQRS.OpportunityTracking.Commands;
using NJS.Application.CQRS.OpportunityTracking.Queries;
using NJS.Domain.Enums;
using Microsoft.AspNetCore.Authorization;

namespace NJSAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class OpportunityTrackingController : ControllerBase
    {
        private readonly IMediator _mediator;

        public OpportunityTrackingController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet]
        public async Task<IActionResult> GetOpportunityTrackings(
            [FromQuery] OpportunityTrackingStatus? status = null,
            [FromQuery] OpportunityStage? stage = null,
            [FromQuery] string? bidManagerId = null,
            [FromQuery] string? clientSector = null,
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string? sortBy = null,
            [FromQuery] bool isAscending = true)
        {
            try
            {
                var query = new GetAllOpportunityTrackingsQuery(
                    status,
                    stage,
                    bidManagerId,
                    clientSector,
                    pageNumber,
                    pageSize,
                    sortBy,
                    isAscending
                );
                var result = await _mediator.Send(query);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving opportunity trackings.", error = ex.Message });
            }
        }

        [HttpGet("bid-manager/{bidManagerId}")]
        public async Task<IActionResult> GetOpportunityTrackingsByBidManager(string bidManagerId)
        {
            try
            {
                var query = new GetOpportunityTrackingsByBidManagerQuery(bidManagerId);
                var result = await _mediator.Send(query);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving opportunity trackings.", error = ex.Message });
            }
        }

        [HttpGet("regional-manager/{regionalManagerId}")]
        public async Task<IActionResult> GetOpportunityTrackingsByRegionalManager(string regionalManagerId)
        {
            try
            {
                var query = new GetOpportunityTrackingsByRegionalManagerQuery(regionalManagerId);
                var result = await _mediator.Send(query);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving opportunity trackings.", error = ex.Message });
            }
        }

        [HttpGet("regional-director/{regionalDirectorId}")]
        public async Task<IActionResult> GetOpportunityTrackingsByRegionalDirector(string regionalDirectorId)
        {
            try
            {
                var query = new GetOpportunityTrackingsByRegionalDirectorQuery(regionalDirectorId);
                var result = await _mediator.Send(query);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving opportunity trackings.", error = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetOpportunityTracking(int id)
        {
            try
            {
                var query = new GetOpportunityTrackingByIdQuery(id);
                var result = await _mediator.Send(query);

                if (result == null)
                {
                    return NotFound($"Opportunity Tracking with ID {id} not found.");
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"An error occurred while retrieving opportunity tracking {id}.", error = ex.Message });
            }
        }

        [HttpGet("project/{projectId}")]
        public async Task<IActionResult> GetOpportunityTrackingsByProject(
            int projectId,
            [FromQuery] OpportunityTrackingStatus? status = null,
            [FromQuery] OpportunityStage? stage = null,
            [FromQuery] string? bidManagerId = null,
            [FromQuery] string? clientSector = null,
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string? sortBy = null,
            [FromQuery] bool isAscending = true)
        {
            try
            {
                var query = new GetAllOpportunityTrackingsQuery(
                    status,
                    stage,
                    bidManagerId,
                    clientSector,
                    pageNumber,
                    pageSize,
                    sortBy,
                    isAscending
                );

                var result = await _mediator.Send(query);

                if (result == null)
                {
                    return NotFound($"No opportunity trackings found for project ID {projectId}.");
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"An error occurred while retrieving opportunity trackings for project {projectId}.", error = ex.Message });
            }
        }

        [HttpPost]
        public async Task<IActionResult> CreateOpportunityTracking([FromBody] CreateOpportunityTrackingCommand command)
        {
            try
            {
                if (command == null)
                {
                    return BadRequest("Opportunity tracking data is null.");
                }

                var result = await _mediator.Send(command);
                return CreatedAtAction(nameof(GetOpportunityTracking), new { id = result.Id }, result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while creating opportunity tracking.", error = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateOpportunityTracking(int id, [FromBody] UpdateOpportunityTrackingCommand command)
        {
            try
            {
                if (id != command.Id)
                {
                    return BadRequest("Mismatched opportunity tracking ID.");
                }

                var result = await _mediator.Send(command);
                if (result == null)
                {
                    return NotFound($"Opportunity tracking with ID {id} not found.");
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"An error occurred while updating opportunity tracking {id}.", error = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteOpportunityTracking(int id)
        {
            try
            {
                var command = new DeleteOpportunityTrackingCommand(id);
                var result = await _mediator.Send(command);

                if (!result)
                {
                    return NotFound($"Opportunity tracking with ID {id} not found.");
                }

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"An error occurred while deleting opportunity tracking {id}.", error = ex.Message });
            }
        }

        /// <summary>
        /// Send To Review by BID Manager
        /// </summary>
        /// <param name="command"></param>
        /// <returns></returns>
        [HttpPost("SendToReview")]
        public async Task<IActionResult> SendToReview([FromBody] SendToReviewCommand command)
        {
            try
            {
                var result = await _mediator.Send(command);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while sending opportunity tracking to review.", error = ex.Message });
            }
        }

        /// <summary>
        /// Send To Review by Regional Manager
        /// </summary>
        /// <param name="command"></param>
        /// <returns></returns>
        [HttpPost("SendToApproval")]
        public async Task<IActionResult> SendToApproval([FromBody] SendToApprovalCommand command)
        {
            try
            {
                var result = await _mediator.Send(command);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while sending opportunity tracking to review.", error = ex.Message });
            }
        }

       /// <summary>
       /// Command for Regional Director
       /// </summary>
       /// <param name="command"></param>
       /// <returns></returns>
        [HttpPost("SendToApprove")]
        public async Task<IActionResult> SendToApprove([FromBody] SendToApproveCommand command)
        {
            try
            {
                var result = await _mediator.Send(command);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while sending opportunity tracking to review.", error = ex.Message });
            }
        }

        /// <summary>
        /// Send to reject by Regional Manager
        /// </summary>
        /// <param name="command"></param>
        /// <returns></returns>
        [HttpPost("Reject")]
        public async Task<IActionResult> RejectOpportunity([FromBody] RejectOpportunityCommand command)
        {
            try
            {
                var result = await _mediator.Send(command);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while rejecting opportunity.", error = ex.Message });
            }
        }
    }
}

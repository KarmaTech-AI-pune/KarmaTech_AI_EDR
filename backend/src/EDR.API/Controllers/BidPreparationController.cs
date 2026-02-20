using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using EDR.Application.CQRS.Commands.BidPreparation;
using EDR.Application.CQRS.Queries.BidPreparation;
using EDR.Application.Dtos;
using System.Security.Claims;

namespace EDR.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class BidPreparationController : ControllerBase
    {
        private readonly IMediator _mediator;

        public BidPreparationController(IMediator mediator)
        {
            _mediator = mediator;
        }


        [HttpGet]
        public async Task<ActionResult<BidPreparationDto>> Get([FromQuery] int opportunityId)
        {
            var userId = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value;
            var query = new GetBidPreparationQuery { UserId = userId, OpportunityId = opportunityId };
            var result = await _mediator.Send(query);

            if (result == null)
            {
                return NotFound();
            }

            return Ok(result);
        }

        [HttpGet("versions")]
        public async Task<ActionResult<List<BidVersionHistoryDto>>> GetVersionHistory([FromQuery] int opportunityId)
        {
            var query = new GetBidVersionHistoryQuery { OpportunityId = opportunityId, UserId = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value, };
            var result = await _mediator.Send(query);
            return Ok(result);
        }

        [HttpPut]
        public async Task<ActionResult<bool>> Update([FromBody] BidPreparationUpdateDto updateDto)
        {
            var command = new UpdateBidPreparationCommand
            {
                UserId = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value,
                OpportunityId = updateDto.OpportunityId,
                DocumentCategoriesJson = updateDto.DocumentCategoriesJson,
                Comments = updateDto.Comments,
                CreatedBy = User.Identity.Name
            };

            var result = await _mediator.Send(command);

            if (!result)
            {
                return BadRequest("Failed to update bid preparation data");
            }

            return CreatedAtAction(nameof(Get), new { id = updateDto.OpportunityId }, result);
        }

        [HttpPost("{opportunityId}/submit")]
        public async Task<ActionResult<bool>> SubmitForApproval(int opportunityId)
        {
            var command = new SubmitBidPreparationCommand
            {
                UserId = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value,
                OpportunityId = opportunityId,
                CreatedBy = User.Identity.Name

            };

            var result = await _mediator.Send(command);

            if (!result)
            {
                return BadRequest("Failed to submit bid preparation for approval");
            }

            return Ok(result);
        }

        [HttpPost("{opportunityId}/approve")]
        [Authorize(Roles = "Regional Director, Regional Manager")]
        public async Task<ActionResult<bool>> ApproveOrReject(int opportunityId, [FromBody] BidPreparationApprovalDto approvalDto)
        {
            var command = new ApproveBidPreparationCommand
            {
                UserId = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value,

                OpportunityId = opportunityId,
                IsApproved = approvalDto.IsApproved,
                Comments = approvalDto.Comments,
                CreatedBy = User.Identity.Name
            };

            var result = await _mediator.Send(command);

            if (!result)
            {
                return BadRequest("Failed to process approval/rejection");
            }

            return Ok(result);
        }
    }
}


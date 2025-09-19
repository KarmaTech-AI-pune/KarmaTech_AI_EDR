using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NJS.Application.CQRS.PendingApproval.Query;
using NJS.Application.DTOs;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace NJSAPI.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class PendingFormsController : ControllerBase
    {
        private readonly IMediator _mediator;

        public PendingFormsController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet]
        public async Task<ActionResult<List<PendingFormDto>>> GetPendingForms()
        {
            var query = new GetPendingFormsQuery();
            var pendingForms = await _mediator.Send(query);
            
            return Ok(pendingForms);
        }
    }
}

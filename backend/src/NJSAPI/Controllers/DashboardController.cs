using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NJS.Application.CQRS.Dashboard.TotalRevenueExpected.Queries;
using NJS.Application.CQRS.PendingApproval.Query;
using NJS.Application.DTOs;
using NJS.Application.DTOs.Dashboard;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace NJSAPI.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class DashboardController : ControllerBase
    {
        private readonly IMediator _mediator;

        public DashboardController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet("pending-forms")]
        public async Task<ActionResult<PendingFormsResponseDto>> GetPendingForms()
        {
            var query = new GetPendingFormsQuery();
            var pendingForms = await _mediator.Send(query);

            return Ok(pendingForms);
        }

        [HttpGet("total-revenue-expected")]
        public async Task<ActionResult<TotalRevenueExpectedDto>> GetTotalRevenueExpected()
        {
            var query = new GetTotalRevenueExpectedQuery();
            var totalRevenueExpected = await _mediator.Send(query);

            return Ok(totalRevenueExpected);
        }
    }
}

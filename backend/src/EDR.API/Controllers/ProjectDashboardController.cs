using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using EDR.Application.CQRS.Dashboard.ProjectDashboard.Queries;
using EDR.Application.Dtos.ProjectDashboard;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;

namespace EDR.API.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class ProjectDashboardController : ControllerBase
    {
        private readonly IMediator _mediator;

        public ProjectDashboardController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet("project/{projectId}")]
        [ProducesResponseType(typeof(ProjectDashboardDto), StatusCodes.Status200OK)]
        public async Task<ActionResult<ProjectDashboardDto>> GetProjectDashboard(int projectId)
        {
            var query = new GetProjectDashboardQuery { ProjectId = projectId };
            var result = await _mediator.Send(query);

            if (result == null)
            {
                return NotFound(new { message = $"Project with ID {projectId} not found." });
            }

            return Ok(result);
        }
    }
}

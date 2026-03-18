using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using EDR.Application.CQRS.WorkBreakdownStructures.Commands;
using EDR.Application.CQRS.WorkBreakdownStructures.Queries;
using EDR.Application.Dtos;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace EDR.API.Controllers
{
    [ApiController]
    [Route("api/projects/{projectId}/wbs/versions")]
    [Authorize]
    public class WBSVersionController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly ILogger<WBSVersionController> _logger;

        public WBSVersionController(IMediator mediator, ILogger<WBSVersionController> logger)
        {
            _mediator = mediator;
            _logger = logger;
        }

        /// <summary>
        /// Get all WBS versions for a project
        /// </summary>
        /// <param name="projectId">The project ID</param>
        /// <returns>List of WBS versions</returns>
        [HttpGet]
        [ProducesResponseType(typeof(List<WBSVersionDto>), 200)]
        [ProducesResponseType(404)]
        public async Task<ActionResult<List<WBSVersionDto>>> GetWBSVersions(int projectId)
        {
            var query = new GetWBSVersionsQuery(projectId);
            var result = await _mediator.Send(query);
            return Ok(result);
        }

        /// <summary>
        /// Get the latest WBS version for a project
        /// </summary>
        /// <param name="projectId">The project ID</param>
        /// <returns>The latest WBS version details</returns>
        [HttpGet("latest")]
        [ProducesResponseType(typeof(WBSVersionDetailsDto), 200)]
        [ProducesResponseType(404)]
        public async Task<ActionResult<WBSVersionDetailsDto>> GetLatestWBSVersion(int projectId)
        {
            var query = new GetLatestWBSVersionQuery(projectId);
            var result = await _mediator.Send(query);
            
            if (result == null)
                return NotFound($"No WBS version found for project {projectId}");

            return Ok(result);
        }

        /// <summary>
        /// Get a specific WBS version
        /// </summary>
        /// <param name="projectId">The project ID</param>
        /// <param name="version">The version number</param>
        /// <returns>The WBS version details</returns>
        [HttpGet("{version}")]
        [ProducesResponseType(typeof(WBSVersionDetailsDto), 200)]
        [ProducesResponseType(404)]
        public async Task<ActionResult<WBSVersionDetailsDto>> GetWBSVersion(int projectId, string version)
        {
            var query = new GetWBSVersionQuery(projectId, version);
            var result = await _mediator.Send(query);
            
            if (result == null)
                return NotFound($"WBS version {version} not found for project {projectId}");

            return Ok(result);
        }

        /// <summary>
        /// Create a new WBS version from the current state
        /// </summary>
        /// <param name="projectId">The project ID</param>
        /// <param name="request">The version creation request</param>
        /// <returns>The new version number</returns>
        [HttpPost]
        [ProducesResponseType(typeof(string), 200)]
        [ProducesResponseType(400)]
        public async Task<ActionResult<string>> CreateWBSVersion(int projectId, [FromBody] CreateWBSVersionRequest request)
        {
            var command = new CreateWBSVersionCommand(projectId, request.Tasks, request.Comments);
            var result = await _mediator.Send(command);
            return Ok(result);
        }

        /// <summary>
        /// Activate a specific WBS version
        /// </summary>
        /// <param name="projectId">The project ID</param>
        /// <param name="version">The version to activate</param>
        /// <returns>Success status</returns>
        [HttpPost("{version}/activate")]
        [ProducesResponseType(200)]
        [ProducesResponseType(404)]
        public async Task<ActionResult> ActivateWBSVersion(int projectId, string version)
        {
            var command = new ActivateWBSVersionCommand(projectId, version);
            await _mediator.Send(command);
            return Ok();
        }

        /// <summary>
        /// Delete a WBS version
        /// </summary>
        /// <param name="projectId">The project ID</param>
        /// <param name="version">The version to delete</param>
        /// <returns>Success status</returns>
        [HttpDelete("{version}")]
        [ProducesResponseType(200)]
        [ProducesResponseType(404)]
        public async Task<ActionResult> DeleteWBSVersion(int projectId, string version)
        {
            var command = new DeleteWBSVersionCommand(projectId, version);
            await _mediator.Send(command);
            return Ok();
        }

        /// <summary>
        /// Get WBS version workflow history
        /// </summary>
        /// <param name="projectId">The project ID</param>
        /// <param name="version">The version number</param>
        /// <returns>Workflow history</returns>
        [HttpGet("{version}/workflow-history")]
        [ProducesResponseType(typeof(List<WBSVersionWorkflowHistoryDto>), 200)]
        [ProducesResponseType(404)]
        public async Task<ActionResult<List<WBSVersionWorkflowHistoryDto>>> GetWBSVersionWorkflowHistory(int projectId, string version)
        {
            // First get the version to get its ID
            var versionQuery = new GetWBSVersionQuery(projectId, version);
            var versionResult = await _mediator.Send(versionQuery);
            
            if (versionResult == null)
                return NotFound($"WBS version {version} not found for project {projectId}");

            var query = new GetWBSVersionWorkflowHistoryQuery(versionResult.Id);
            var result = await _mediator.Send(query);
            return Ok(result);
        }
    }

    /// <summary>
    /// Request model for creating a new WBS version
    /// </summary>
    public class CreateWBSVersionRequest
    {
        public List<WBSTaskDto> Tasks { get; set; } = new();
        public string Comments { get; set; }
    }
} 

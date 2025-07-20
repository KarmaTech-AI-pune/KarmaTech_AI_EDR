using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NJS.Application.Dtos;
using NJS.Domain.Database;
using NJS.Domain.Entities;
using NJS.Domain.Enums;
using System.Linq;
using System.Threading.Tasks;
using NJS.Application.Services.IContract;

namespace NJSAPI.Controllers
{
    [ApiController]
    [Route("api/projects/{projectId}/wbs/header")]
    [Authorize]
    [ApiExplorerSettings(GroupName = "v1")]
    public class WBSHeaderController : ControllerBase
    {
        private readonly ProjectManagementContext _context;
        private readonly ILogger<WBSHeaderController> _logger;
        private readonly IUserContext _userContext;

        public WBSHeaderController(ProjectManagementContext context, ILogger<WBSHeaderController> logger, IUserContext userContext)
        {
            _context = context;
            _logger = logger;
            _userContext = userContext;
        }

        /// <summary>
        /// Gets the WBS header for a project and task type
        /// </summary>
        /// <param name="projectId">The project ID</param>
        /// <param name="taskType">The task type (0 for Manpower, 1 for ODC)</param>
        /// <returns>The WBS header with its history</returns>
        [HttpGet("{taskType}")]
        [ProducesResponseType(typeof(WBSTaskPlannedHourHeader), 200)]
        [ProducesResponseType(404)]
        public async Task<ActionResult<WBSTaskPlannedHourHeader>> GetWBSHeader(int projectId, TaskType taskType)
        {
            var header = await _context.Set<WBSTaskPlannedHourHeader>()
                .Include(h => h.WBSHistories)
                .ThenInclude(h => h.Status)
                .FirstOrDefaultAsync(h => h.ProjectId == projectId && h.TaskType == taskType);

            if (header == null)
            {
                return NotFound($"WBS header not found for project {projectId} and task type {taskType}");
            }

            return Ok(header);
        }

        /// <summary>
        /// Gets the current status of a WBS header (returns latest version status for backward compatibility)
        /// </summary>
        /// <param name="projectId">The project ID</param>
        /// <param name="taskType">The task type (0 for Manpower, 1 for ODC)</param>
        /// <returns>The current status of the WBS header</returns>
        [HttpGet("{taskType}/status")]
        [ProducesResponseType(typeof(object), 200)]
        [ProducesResponseType(404)]
        public async Task<ActionResult<WbsWorkflowDto>> GetWBSHeaderStatus(int projectId, TaskType taskType)
        {
            var header = await _context.Set<WBSTaskPlannedHourHeader>()
                .Include(h => h.WBSHistories.OrderByDescending(h => h.ActionDate).Where(h => !h.IsDeleted))
                .ThenInclude(h => h.Status).FirstOrDefaultAsync(h => h.ProjectId == projectId && h.TaskType == taskType);

            if (header == null)
            {
                return Ok(header);
            }

            if (header.StatusId == (int)PMWorkflowStatusEnum.Approved)
            {
                _logger.LogInformation($"WBS Header {header.Id} is APPROVED, creating a new instance");

                var result = new WbsWorkflowDto
                {
                    Id = header.Id,
                    StatusId = header.StatusId,
                    Status = "Approved"
                };

                return Ok(result);
            }

            var latestHistory = header.WBSHistories
                .OrderByDescending(h => h.ActionDate)
                .FirstOrDefault();

            if (latestHistory == null)
            {
                _logger.LogInformation($"WBS Header {header.Id} has no history entries, returning Initial status");

                return Ok(new WbsWorkflowDto
                {
                    Id = header.Id,
                    StatusId = 1,
                    Status = "Initial"
                });

            }

            string statusName = Enum.GetName(typeof(PMWorkflowStatusEnum), latestHistory.StatusId) ?? "Initial";

            string userFriendlyStatus = statusName switch

            {

                "Initial" => "Initial",

                "SentForReview" => "Sent for Review",

                "ReviewChanges" => "Review Changes",

                "SentForApproval" => "Sent for Approval",

                "ApprovalChanges" => "Approval Changes",

                "Approved" => "Approved",

                _ => "Initial"

            };

            _logger.LogInformation($"WBS Header {header.Id} status: {latestHistory.StatusId} - Enum: {statusName} - Friendly: {userFriendlyStatus}");

            return Ok(new WbsWorkflowDto

            {

                Id = header.Id,

                StatusId = latestHistory.StatusId,

                Status = userFriendlyStatus

            });

        }       
    }
}

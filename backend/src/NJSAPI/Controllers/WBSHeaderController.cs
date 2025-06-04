using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NJS.Domain.Database;
using NJS.Domain.Entities;
using NJS.Domain.Enums;
using System.Linq;
using System.Threading.Tasks;

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

        public WBSHeaderController(ProjectManagementContext context, ILogger<WBSHeaderController> logger)
        {
            _context = context;
            _logger = logger;
        }

        /// <summary>
        /// Gets the WBS header for a project and task type
        /// </summary>
        /// <param name="projectId">The project ID</param>
        /// <param name="taskType">The task type (0 for Manpower, 1 for ODC)</param>
        /// <returns>The WBS header with its history</returns>
        [HttpGet("{taskType}")]
        [ProducesResponseType(typeof(WBSTaskMonthlyHourHeader), 200)]
        [ProducesResponseType(404)]
        public async Task<ActionResult<WBSTaskMonthlyHourHeader>> GetWBSHeader(int projectId, TaskType taskType)
        {
            var header = await _context.Set<WBSTaskMonthlyHourHeader>()
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
        /// Gets the current status of a WBS header
        /// </summary>
        /// <param name="projectId">The project ID</param>
        /// <param name="taskType">The task type (0 for Manpower, 1 for ODC)</param>
        /// <returns>The current status of the WBS header</returns>
        [HttpGet("{taskType}/status")]
        [ProducesResponseType(typeof(object), 200)]
        [ProducesResponseType(404)]
        public async Task<ActionResult<object>> GetWBSHeaderStatus(int projectId, TaskType taskType)
        {
            var header = await _context.Set<WBSTaskMonthlyHourHeader>()
                .Include(h => h.WBSHistories)
                .ThenInclude(h => h.Status)
                .FirstOrDefaultAsync(h => h.ProjectId == projectId && h.TaskType == taskType);

            if (header == null)
            {
                return NotFound($"WBS header not found for project {projectId} and task type {taskType}");
            }

            // Check if the header has a direct status (for approved headers)
            if (header.StatusId == (int)PMWorkflowStatusEnum.Approved)
            {
                // For approved headers, use the direct status
                Console.WriteLine($"WBS Header {header.Id} is APPROVED (using direct status)");

                return Ok(new
                {
                    id = header.Id,
                    statusId = (int)PMWorkflowStatusEnum.Approved,
                    status = "Approved"
                });
            }

            // Get the latest history entry
            var latestHistory = header.WBSHistories
                .OrderByDescending(h => h.ActionDate)
                .FirstOrDefault();

            if (latestHistory == null)
            {
                Console.WriteLine($"WBS Header {header.Id} has no history entries, returning Initial status");
                return Ok(new { id = header.Id, statusId = 1, status = "Initial" });
            }

            // Get the status name from the enum
            string statusName = Enum.GetName(typeof(PMWorkflowStatusEnum), latestHistory.StatusId) ?? "Initial";

            // Map the enum name to a user-friendly status name
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

            // Log the status retrieval for debugging
            _logger.LogInformation($"WBS Header {header.Id} status: {latestHistory.StatusId} - Enum: {statusName} - Friendly: {userFriendlyStatus}");

            return Ok(new
            {
                id = header.Id,
                statusId = latestHistory.StatusId,
                status = userFriendlyStatus
            });
        }
    }
}

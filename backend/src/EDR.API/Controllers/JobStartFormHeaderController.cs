using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EDR.Domain.Database;
using EDR.Domain.Entities;
using EDR.Domain.Enums;
using System.Linq;
using System.Threading.Tasks;

namespace EDR.API.Controllers
{
    [ApiController]
    [Route("api/projects/{projectId}/jobstartforms/header")]
    [Authorize]
    public class JobStartFormHeaderController : ControllerBase
    {
        private readonly ProjectManagementContext _context;

        public JobStartFormHeaderController(ProjectManagementContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Gets the JobStartForm header for a project and form ID
        /// </summary>
        /// <param name="projectId">The project ID</param>
        /// <param name="formId">The form ID</param>
        /// <returns>The JobStartForm header with its history</returns>
        [HttpGet("{formId}")]
        [ProducesResponseType(typeof(JobStartFormHeader), 200)]
        [ProducesResponseType(404)]
        public async Task<ActionResult<JobStartFormHeader>> GetJobStartFormHeader(int projectId, int formId)
        {
            var header = await _context.Set<JobStartFormHeader>()
                .Include(h => h.JobStartFormHistories)
                .ThenInclude(h => h.Status)
                .FirstOrDefaultAsync(h => h.ProjectId == projectId && h.FormId == formId);

            if (header == null)
            {
                return NotFound($"JobStartForm header not found for project {projectId} and form {formId}");
            }

            return Ok(header);
        }

        /// <summary>
        /// Gets the current status of a JobStartForm header
        /// </summary>
        /// <param name="projectId">The project ID</param>
        /// <param name="formId">The form ID</param>
        /// <returns>The current status of the JobStartForm header</returns>
        [HttpGet("{formId}/status")]
        [ProducesResponseType(typeof(object), 200)]
        [ProducesResponseType(404)]
        public async Task<ActionResult<object>> GetJobStartFormHeaderStatus(int projectId, int formId)
        {
            var header = await _context.Set<JobStartFormHeader>()
                .Include(h => h.JobStartFormHistories)
                .ThenInclude(h => h.Status)
                .FirstOrDefaultAsync(h => h.ProjectId == projectId && h.FormId == formId);

            if (header == null)
            {
                return NotFound($"JobStartForm header not found for project {projectId} and form {formId}");
            }

            // Check if the header has a direct status (for approved headers)
            if (header.StatusId == (int)PMWorkflowStatusEnum.Approved)
            {
                // For approved headers, use the direct status
                Console.WriteLine($"JobStartForm Header {header.Id} is APPROVED (using direct status)");

                return Ok(new
                {
                    id = header.Id,
                    statusId = (int)PMWorkflowStatusEnum.Approved,
                    status = "Approved"
                });
            }

            // Get the latest history entry
            var latestHistory = header.JobStartFormHistories
                .OrderByDescending(h => h.ActionDate)
                .FirstOrDefault();

            if (latestHistory == null)
            {
                // If no history entries exist, use the header's status
                return Ok(new
                {
                    id = header.Id,
                    statusId = header.StatusId,
                    status = header.Status?.Status ?? "Unknown"
                });
            }

            // Return the status from the latest history entry
            return Ok(new
            {
                id = header.Id,
                statusId = latestHistory.StatusId,
                status = latestHistory.Status?.Status ?? "Unknown"
            });
        }

        /// <summary>
        /// Gets the history of a JobStartForm header
        /// </summary>
        /// <param name="projectId">The project ID</param>
        /// <param name="formId">The form ID</param>
        /// <returns>The history of the JobStartForm header</returns>
        [HttpGet("{formId}/history")]
        [ProducesResponseType(typeof(IEnumerable<JobStartFormHistory>), 200)]
        [ProducesResponseType(404)]
        public async Task<ActionResult<IEnumerable<JobStartFormHistory>>> GetJobStartFormHeaderHistory(int projectId, int formId)
        {
            var header = await _context.Set<JobStartFormHeader>()
                .Include(h => h.JobStartFormHistories)
                .ThenInclude(h => h.Status)
                .Include(h => h.JobStartFormHistories)
                .ThenInclude(h => h.ActionUser)
                .Include(h => h.JobStartFormHistories)
                .ThenInclude(h => h.AssignedTo)
                .FirstOrDefaultAsync(h => h.ProjectId == projectId && h.FormId == formId);

            if (header == null)
            {
                return NotFound($"JobStartForm header not found for project {projectId} and form {formId}");
            }

            var history = header.JobStartFormHistories
                .OrderByDescending(h => h.ActionDate)
                .ToList();

            return Ok(history);
        }
    }
}


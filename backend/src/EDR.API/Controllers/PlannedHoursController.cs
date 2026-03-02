using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EDR.Domain.Database;
using EDR.Domain.Entities;

namespace EDR.API.Controllers
{
    [ApiController]
    [Route("api/projects/{projectId}/plannedhours")]
    public class PlannedHoursController : ControllerBase
    {
        private readonly ProjectManagementContext _context;

        public PlannedHoursController(ProjectManagementContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Get planned hours for a project
        /// </summary>
        /// <param name="projectId">Project ID</param>
        /// <returns>Planned hours data</returns>
        [HttpGet]
        public async Task<IActionResult> GetPlannedHours(int projectId)
        {
            var wbs = await _context.WorkBreakdownStructures
                .Include(w => w.Tasks)
                    .ThenInclude(t => t.PlannedHours)
                .AsNoTracking()
                .Include(w => w.WBSHeader) // Ensure WBSHeader is loaded
                .FirstOrDefaultAsync(w => w.WBSHeader.ProjectId == projectId && w.WBSHeader.IsActive);

            if (wbs == null)
            {
                return Ok(new { plannedHours = Array.Empty<object>() });
            }

            var plannedHours = wbs.Tasks
                .Where(t => !t.IsDeleted)
                .SelectMany(t => t.PlannedHours.Select(ph => new
                {
                    task_id = t.Id,
                    year = ph.Year,
                    month = ph.Month,
                    planned_hours = ph.PlannedHours,
                    actual_hours = ph.ActualHours
                }))
                .ToList();

            return Ok(plannedHours);
        }

        /// <summary>
        /// Update planned hours for a task
        /// </summary>
        /// <param name="projectId">Project ID</param>
        /// <param name="taskId">Task ID</param>
        /// <param name="data">Planned hours data</param>
        /// <returns>Updated planned hours data</returns>
        [HttpPut("tasks/{taskId}/plannedhours")]
        public async Task<IActionResult> UpdatePlannedHours(
            int projectId,
            int taskId,
            [FromBody] UpdatePlannedHoursRequest data)
        {
            var task = await _context.WBSTasks
                .Include(t => t.PlannedHours)
                .Include(t => t.UserWBSTasks)
                .FirstOrDefaultAsync(t => t.Id == taskId &&
                                         t.WorkBreakdownStructure.WBSHeader.ProjectId == projectId &&
                                         !t.IsDeleted);

            if (task == null)
            {
                return NotFound();
            }

            // Remove existing planned hours
            foreach (var existingHour in task.PlannedHours.ToList())
            {
                _context.Remove(existingHour);
            }

            // Add new planned hours
            foreach (var ph in data.PlannedHours)
            {
                var newPlannedHour = new WBSTaskPlannedHour
                {
                    WBSTaskId = taskId,
                    Year = ph.Year,
                    Month = ph.Month,
                    PlannedHours = ph.PlannedHours,
                    CreatedAt = DateTime.UtcNow,
                    CreatedBy = "System" // Replace with current user
                };

                _context.Add(newPlannedHour);
            }

            // Update total hours and cost in UserWBSTask
            var totalHours = data.PlannedHours.Sum(ph => ph.PlannedHours);
            var userTask = task.UserWBSTasks.FirstOrDefault();

            if (userTask != null)
            {
                userTask.TotalHours = totalHours;
                userTask.TotalCost = (decimal)totalHours * userTask.CostRate;
                userTask.UpdatedAt = DateTime.UtcNow;
                userTask.UpdatedBy = "System"; // Replace with current user
            }

            await _context.SaveChangesAsync();

            return Ok(new
            {
                planned_hours = data.PlannedHours,
                total_hours = totalHours,
                total_cost = userTask?.TotalCost ?? 0
            });
        }
    }

    public class PlannedHourData
    {
        public string Year { get; set; }
        public string Month { get; set; }
        public double PlannedHours { get; set; }
    }

    public class UpdatePlannedHoursRequest
    {
        public PlannedHourData[] PlannedHours { get; set; }
    }
}


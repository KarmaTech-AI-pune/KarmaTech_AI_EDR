using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NJS.Domain.Database;
using NJS.Domain.Entities;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace NJSAPI.Controllers
{
    [ApiController]
    [Route("api/projects/{projectId}/monthlyhours")]
    public class MonthlyHoursController : ControllerBase
    {
        private readonly ProjectManagementContext _context;

        public MonthlyHoursController(ProjectManagementContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Get monthly hours for a project
        /// </summary>
        /// <param name="projectId">Project ID</param>
        /// <returns>Monthly hours data</returns>
        [HttpGet]
        public async Task<IActionResult> GetMonthlyHours(int projectId)
        {
            var wbs = await _context.WorkBreakdownStructures
                .Include(w => w.Tasks)
                    .ThenInclude(t => t.MonthlyHours)
                .AsNoTracking()
                .FirstOrDefaultAsync(w => w.ProjectId == projectId && w.IsActive);

            if (wbs == null)
            {
                return Ok(new { monthlyHours = Array.Empty<object>() });
            }

            var monthlyHours = wbs.Tasks
                .Where(t => !t.IsDeleted)
                .SelectMany(t => t.MonthlyHours.Select(mh => new
                {
                    task_id = t.Id,
                    year = mh.Year,
                    month = mh.Month,
                    planned_hours = mh.PlannedHours,
                    actual_hours = mh.ActualHours
                }))
                .ToList();

            return Ok(monthlyHours);
        }

        /// <summary>
        /// Update monthly hours for a task
        /// </summary>
        /// <param name="projectId">Project ID</param>
        /// <param name="taskId">Task ID</param>
        /// <param name="data">Monthly hours data</param>
        /// <returns>Updated monthly hours data</returns>
        [HttpPut("tasks/{taskId}/monthlyhours")]
        public async Task<IActionResult> UpdateMonthlyHours(
            int projectId, 
            int taskId, 
            [FromBody] UpdateMonthlyHoursRequest data)
        {
            var task = await _context.WBSTasks
                .Include(t => t.MonthlyHours)
                .Include(t => t.UserWBSTasks)
                .FirstOrDefaultAsync(t => t.Id == taskId && 
                                         t.WorkBreakdownStructure.ProjectId == projectId && 
                                         !t.IsDeleted);

            if (task == null)
            {
                return NotFound();
            }

            // Remove existing monthly hours
            foreach (var existingHour in task.MonthlyHours.ToList())
            {
                _context.Remove(existingHour);
            }

            // Add new monthly hours
            foreach (var mh in data.MonthlyHours)
            {
                var newMonthlyHour = new WBSTaskMonthlyHour
                {
                    WBSTaskId = taskId,
                    Year = mh.Year,
                    Month = mh.Month,
                    PlannedHours = mh.PlannedHours,
                    CreatedAt = DateTime.UtcNow,
                    CreatedBy = "System" // Replace with current user
                };

                _context.Add(newMonthlyHour);
            }

            // Update total hours and cost in UserWBSTask
            var totalHours = data.MonthlyHours.Sum(mh => mh.PlannedHours);
            var userTask = task.UserWBSTasks.FirstOrDefault();
            
            if (userTask != null)
            {
                userTask.TotalHours = totalHours;
                userTask.TotalCost = (decimal)totalHours * userTask.CostRate + userTask.ODCCost;
                userTask.UpdatedAt = DateTime.UtcNow;
                userTask.UpdatedBy = "System"; // Replace with current user
            }

            await _context.SaveChangesAsync();

            return Ok(new
            {
                monthly_hours = data.MonthlyHours,
                total_hours = totalHours,
                total_cost = userTask?.TotalCost ?? 0
            });
        }
    }

    public class MonthlyHourData
    {
        public string Year { get; set; }
        public string Month { get; set; }
        public double PlannedHours { get; set; }
    }

    public class UpdateMonthlyHoursRequest
    {
        public MonthlyHourData[] MonthlyHours { get; set; }
    }
}

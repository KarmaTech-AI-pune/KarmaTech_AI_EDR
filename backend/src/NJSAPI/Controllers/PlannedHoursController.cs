using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NJS.Domain.Database;
using NJS.Domain.Entities;
using NJS.Domain.Enums;
using NJS.Application.Dtos;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace NJSAPI.Controllers
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
                .FirstOrDefaultAsync(w => w.ProjectId == projectId && w.IsActive);

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
                    monthno = ph.Month,
                    date = ph.Date?.ToString("yyyy-MM-dd"),
                    weekno = ph.WeekNumber,
                    planned_hours = ph.PlannedHours,
                    actual_hours = ph.ActualHours
                }))
                .ToList();

            return Ok(plannedHours);
        }



        /// <summary>
        /// Update a specific planned hour record by ID
        /// </summary>
        /// <param name="projectId">Project ID</param>
        /// <param name="taskId">Task ID</param>
        /// <param name="plannedHoursId">Planned Hours ID</param>
        /// <param name="data">Planned hour data</param>
        /// <returns>Updated planned hour data</returns>
        [HttpPut("tasks/{taskId}/plannedhours/{plannedHoursId}")]
        public async Task<IActionResult> UpdateSpecificPlannedHour(
            int projectId,
            int taskId,
            int plannedHoursId,
            [FromBody] PlannedHourDto data)
        {
            // Find the specific planned hour record
            var plannedHour = await _context.WBSTaskPlannedHours
                .Include(ph => ph.WBSTask)
                    .ThenInclude(t => t.WorkBreakdownStructure)
                .FirstOrDefaultAsync(ph => ph.Id == plannedHoursId &&
                                          ph.WBSTaskId == taskId &&
                                          ph.WBSTask.WorkBreakdownStructure.ProjectId == projectId);

            if (plannedHour == null)
            {
                return NotFound($"Planned hour record with ID {plannedHoursId} not found");
            }

            // Context-aware validation for planned hours based on planning type
            if (data.WeekNo.HasValue && data.WeekNo.Value > 0)
            {
                // Weekly planning: max 160 hours per week
                if (data.PlannedHours > 160)
                {
                    return BadRequest("Planned hours cannot exceed 160 hours per week");
                }
            }
            else if (data.Date.HasValue)
            {
                // Daily planning: max 24 hours per day (date is optional but when provided enables daily planning)
                if (data.PlannedHours > 24)
                {
                    return BadRequest("Planned hours cannot exceed 24 hours per day");
                }
            }
            else
            {
                // Monthly planning: max 160 hours per month (default when no date or week specified)
                if (data.PlannedHours > 160)
                {
                    return BadRequest("Planned hours cannot exceed 160 hours per month");
                }
            }

            // Update the planned hour record
            plannedHour.Year = data.Year.ToString();
            plannedHour.Month = data.MonthNo;
            plannedHour.Date = data.Date; // Optional date field - null for monthly planning, date for daily planning
            plannedHour.WeekNumber = data.WeekNo; // Optional week number for weekly planning
            plannedHour.PlannedHours = data.PlannedHours;
            plannedHour.UpdatedAt = DateTime.UtcNow;
            plannedHour.UpdatedBy = "System"; // Replace with current user

            await _context.SaveChangesAsync();

            // Return the updated planned hour
            var result = new PlannedHourDto
            {
                Year = int.Parse(plannedHour.Year),
                MonthNo = plannedHour.Month,
                Date = plannedHour.Date,
                WeekNo = plannedHour.WeekNumber,
                PlannedHours = plannedHour.PlannedHours
            };

            return Ok(result);
        }

        /// <summary>
        /// Add planned hours for a WBS task.
        /// Date field is optional - when not provided, defaults to monthly planning.
        /// When date is provided, enables daily planning with 24-hour validation.
        /// </summary>
        /// <param name="projectId">Project ID</param>
        /// <param name="taskId">Task ID</param>
        /// <param name="plannedHourDto">Planned hour data with optional date field</param>
        /// <returns>Created planned hour</returns>
        [HttpPost("tasks/{taskId}/planned-hours")]
        public async Task<IActionResult> AddPlannedHours(int projectId, int taskId, [FromBody] PlannedHourDto plannedHourDto)
        {
            // Context-aware validation for planned hours based on planning type
            if (plannedHourDto.WeekNo.HasValue && plannedHourDto.WeekNo.Value > 0)
            {
                // Weekly planning: max 160 hours per week
                if (plannedHourDto.PlannedHours > 160)
                {
                    return BadRequest("Planned hours cannot exceed 160 hours per week");
                }
            }
            else if (plannedHourDto.Date.HasValue)
            {
                // Daily planning: max 24 hours per day (date is optional but when provided enables daily planning)
                if (plannedHourDto.PlannedHours > 24)
                {
                    return BadRequest("Planned hours cannot exceed 24 hours per day");
                }
            }
            else
            {
                // Monthly planning: max 160 hours per month (default when no date or week specified)
                if (plannedHourDto.PlannedHours > 160)
                {
                    return BadRequest("Planned hours cannot exceed 160 hours per month");
                }
            }

            var task = await _context.WBSTasks
                .Include(t => t.PlannedHours)
                .Include(t => t.WorkBreakdownStructure)
                .FirstOrDefaultAsync(t => t.Id == taskId &&
                                         t.WorkBreakdownStructure.ProjectId == projectId &&
                                         !t.IsDeleted);

            if (task == null)
            {
                return NotFound($"WBS Task with ID {taskId} not found");
            }

            // Get or create the WBSTaskPlannedHourHeader for this project and task type
            var plannedHourHeader = await _context.WBSTaskPlannedHourHeaders
                .FirstOrDefaultAsync(h => h.ProjectId == projectId && h.TaskType == task.TaskType);

            if (plannedHourHeader == null)
            {
                plannedHourHeader = new WBSTaskPlannedHourHeader
                {
                    ProjectId = projectId,
                    CreatedAt = DateTime.UtcNow,
                    CreatedBy = "System", // Replace with current user
                    TaskType = task.TaskType,
                    StatusId = (int)PMWorkflowStatusEnum.Initial // Default status
                };
                _context.WBSTaskPlannedHourHeaders.Add(plannedHourHeader);
                await _context.SaveChangesAsync(); // Save to get the ID
            }

            var plannedHour = new WBSTaskPlannedHour
            {
                WBSTaskId = taskId,
                WBSTaskPlannedHourHeaderId = plannedHourHeader.Id, // Set the required foreign key
                Year = plannedHourDto.Year.ToString(),
                Month = plannedHourDto.MonthNo,
                Date = plannedHourDto.Date, // Optional date field - null for monthly planning, date for daily planning
                WeekNumber = plannedHourDto.WeekNo, // Optional week number for weekly planning
                PlannedHours = plannedHourDto.PlannedHours,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = "System" // Replace with current user
            };

            _context.WBSTaskPlannedHours.Add(plannedHour);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetPlannedHours), new { projectId }, plannedHourDto);
        }

        /// <summary>
        /// Delete planned hours for a WBS task
        /// </summary>
        /// <param name="projectId">Project ID</param>
        /// <param name="taskId">Task ID</param>
        /// <param name="plannedHourId">Planned Hour ID</param>
        /// <returns>Success or error response</returns>
        [HttpDelete("tasks/{taskId}/planned-hours/{plannedHourId}")]
        public async Task<IActionResult> DeletePlannedHours(int projectId, int taskId, int plannedHourId)
        {
            var plannedHour = await _context.WBSTaskPlannedHours
                .Include(ph => ph.WBSTask)
                .ThenInclude(t => t.WorkBreakdownStructure)
                .FirstOrDefaultAsync(ph => ph.Id == plannedHourId &&
                                          ph.WBSTaskId == taskId &&
                                          ph.WBSTask.WorkBreakdownStructure.ProjectId == projectId);

            if (plannedHour == null)
            {
                return BadRequest($"Invalid planned hour ID {plannedHourId} for task {taskId}");
            }

            _context.WBSTaskPlannedHours.Remove(plannedHour);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Planned hour deleted successfully" });
        }
    }

    public class PlannedHourData
    {
        public string Year { get; set; }
        public int MonthNo { get; set; } // Changed from string Month to int MonthNo
        public DateTime? Date { get; set; }
        public int? WeekNo { get; set; }
        public double PlannedHours { get; set; }
    }

    public class UpdatePlannedHoursRequest
    {
        public PlannedHourData[] PlannedHours { get; set; }
    }
}

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using MediatR;
using NJS.Application.Dtos;
using NJS.Application.CQRS.WorkBreakdownStructures.Queries;
using NJS.Domain.Entities;
using NJS.Domain.Enums;
using NJS.Domain.Database;

namespace NJS.Application.CQRS.WorkBreakdownStructures.Handlers
{
    /// <summary>
    /// Handler for GetManpowerResourcesWithPlannedHoursQuery
    /// </summary>
    public class GetManpowerResourcesWithPlannedHoursQueryHandler : 
        IRequestHandler<GetManpowerResourcesWithPlannedHoursQuery, ManpowerResourcesWithPlannedHoursDto>
    {
        private readonly ProjectManagementContext _context;
        private readonly UserManager<User> _userManager;
        private readonly ILogger<GetManpowerResourcesWithPlannedHoursQueryHandler> _logger;

        /// <summary>
        /// Initializes a new instance of the <see cref="GetManpowerResourcesWithPlannedHoursQueryHandler"/> class.
        /// </summary>
        /// <param name="context">The database context.</param>
        /// <param name="userManager">The user manager.</param>
        /// <param name="logger">The logger.</param>
        public GetManpowerResourcesWithPlannedHoursQueryHandler(
            ProjectManagementContext context,
            UserManager<User> userManager,
            ILogger<GetManpowerResourcesWithPlannedHoursQueryHandler> logger)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
            _userManager = userManager ?? throw new ArgumentNullException(nameof(userManager));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        /// <summary>
        /// Handles the specified request.
        /// </summary>
        /// <param name="request">The request.</param>
        /// <param name="cancellationToken">The cancellation token.</param>
        /// <returns>A task containing the manpower resources with planned hours.</returns>
        public async Task<ManpowerResourcesWithPlannedHoursDto> Handle(
            GetManpowerResourcesWithPlannedHoursQuery request, 
            CancellationToken cancellationToken)
        {
            try
            {
                _logger.LogInformation("Retrieving manpower resources with planned hours for project {ProjectId}", request.ProjectId);
                
                // Check if project exists
                var projectExists = await _context.Projects
                    .AnyAsync(p => p.Id == request.ProjectId, cancellationToken);
                
                if (!projectExists)
                {
                    _logger.LogWarning("Project {ProjectId} not found", request.ProjectId);
                    return null; // Return null to allow controller to return NotFound
                }
                
                // Get the active WBS for the project
                var wbs = await _context.WorkBreakdownStructures
                    .Include(w => w.Tasks.Where(t => !t.IsDeleted && t.TaskType == TaskType.Manpower))
                        .ThenInclude(t => t.UserWBSTasks)
                            .ThenInclude(ut => ut.User)
                    .Include(w => w.Tasks.Where(t => !t.IsDeleted && t.TaskType == TaskType.Manpower))
                        .ThenInclude(t => t.PlannedHours)
                    .AsNoTracking()
                    .FirstOrDefaultAsync(w => w.ProjectId == request.ProjectId && w.IsActive, cancellationToken);

                if (wbs == null)
                {
                    _logger.LogInformation("No active WBS found for project {ProjectId}", request.ProjectId);
                    
                    // Return empty result if no WBS found
                    return new ManpowerResourcesWithPlannedHoursDto
                    {
                        ProjectId = request.ProjectId,
                        Resources = Array.Empty<ManpowerResourceDto>()
                    };
                }

                var resources = new List<ManpowerResourceDto>();

                // Process each task with user assignments - ONLY for Manpower tasks (TaskType = 0)
                foreach (var task in wbs.Tasks)
                {
                    foreach (var userTask in task.UserWBSTasks)
                    {
                        try
                        {
                            // Get the user's first role (if any)
                            string roleId = string.Empty;
                            if (userTask.User != null)
                            {
                                // We'll use an empty string as default if no roles are found
                                roleId = string.Empty;
                            }

                            var resource = new ManpowerResourceDto
                            {
                                TaskId = task.Id.ToString(),
                                TaskTitle = task.Title,
                                RoleId = roleId,
                                EmployeeId = userTask.UserId ?? string.Empty,
                                EmployeeName = userTask.User?.Name ?? "Unknown",
                                IsConsultant = userTask.User?.IsConsultant ?? false,
                                CostRate = userTask.CostRate,
                                TotalHours = (decimal)userTask.TotalHours,
                                TotalCost = userTask.TotalCost,
                                PlannedHours = task.PlannedHours
                                    .Select(ph => new PlannedHourDto
                                    {
                                        Year = int.TryParse(ph.Year, out var year) ? year : DateTime.Now.Year,
                                        MonthNo = ph.Month,
                                    Date = ph.Date,
                                    WeekNo = ph.WeekNumber,
                                        PlannedHours = ph.PlannedHours
                                    })
                                    .OrderBy(ph => ph.Year)
                                    .ThenBy(ph => GetMonthOrder(ph.MonthNo))
                                    .ToList()
                            };

                            resources.Add(resource);
                        }
                        catch (Exception ex)
                        {
                            // Log the error but continue processing other resources
                            _logger.LogError(ex, "Error processing resource for task {TaskId} in project {ProjectId}", 
                                task.Id, request.ProjectId);
                        }
                    }
                }

                _logger.LogInformation("Successfully retrieved {Count} manpower resources for project {ProjectId}", 
                    resources.Count, request.ProjectId);
                
                return new ManpowerResourcesWithPlannedHoursDto
                {
                    ProjectId = request.ProjectId,
                    Resources = resources
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving manpower resources for project {ProjectId}", request.ProjectId);
                throw; // Let the controller handle the exception
            }
        }

        /// <summary>
        /// Gets the month order for sorting purposes.
        /// </summary>
        /// <param name="monthNo">Month number (1-12).</param>
        /// <returns>The month order (1-12).</returns>
        private static int GetMonthOrder(int monthNo)
        {
            return monthNo >= 1 && monthNo <= 12 ? monthNo : 13; // Invalid months go to the end
        }
    }
}

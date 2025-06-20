using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using NJS.Application.CQRS.WorkBreakdownStructures.Queries;
using NJS.Application.Dtos;
using NJS.Domain.Database;
using NJS.Domain.Entities;

namespace NJS.Application.CQRS.WorkBreakdownStructures.Handlers
{
    /// <summary>
    /// Handler for GetManpowerResourcesWithMonthlyHoursQuery
    /// </summary>
    public class GetManpowerResourcesWithMonthlyHoursQueryHandler : 
        IRequestHandler<GetManpowerResourcesWithMonthlyHoursQuery, ManpowerResourcesWithMonthlyHoursDto>
    {
        private readonly ProjectManagementContext _context;
        private readonly UserManager<User> _userManager;
        private readonly ILogger<GetManpowerResourcesWithMonthlyHoursQueryHandler> _logger;

        /// <summary>
        /// Initializes a new instance of the <see cref="GetManpowerResourcesWithMonthlyHoursQueryHandler"/> class.
        /// </summary>
        /// <param name="context">The database context.</param>
        /// <param name="userManager">The user manager.</param>
        /// <param name="logger">The logger.</param>
        /// <exception cref="ArgumentNullException">Thrown when any parameter is null.</exception>
        public GetManpowerResourcesWithMonthlyHoursQueryHandler(
            ProjectManagementContext context, 
            UserManager<User> userManager,
            ILogger<GetManpowerResourcesWithMonthlyHoursQueryHandler> logger)
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
        /// <returns>A task containing the manpower resources with monthly hours.</returns>
        public async Task<ManpowerResourcesWithMonthlyHoursDto> Handle(
            GetManpowerResourcesWithMonthlyHoursQuery request, 
            CancellationToken cancellationToken)
        {
            try
            {
                _logger.LogInformation("Retrieving manpower resources with monthly hours for project {ProjectId}", request.ProjectId);
                
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
                        .ThenInclude(t => t.MonthlyHours)
                    .AsNoTracking()
                    .FirstOrDefaultAsync(w => w.ProjectId == request.ProjectId && w.IsActive, cancellationToken);

                if (wbs == null)
                {
                    _logger.LogInformation("No active WBS found for project {ProjectId}", request.ProjectId);
                    
                    // Return empty result if no WBS found
                    return new ManpowerResourcesWithMonthlyHoursDto
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
                                MonthlyHours = task.MonthlyHours
                                    .Select(mh => new MonthlyHourDto
                                    {
                                        Year = int.TryParse(mh.Year, out var year) ? year : DateTime.Now.Year,
                                        Month = mh.Month,
                                        PlannedHours = mh.PlannedHours
                                    })
                                    .OrderBy(mh => mh.Year)
                                    .ThenBy(mh => GetMonthOrder(mh.Month))
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
                
                return new ManpowerResourcesWithMonthlyHoursDto
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
        /// Gets the numeric order of a month for sorting purposes.
        /// </summary>
        /// <param name="month">The month name.</param>
        /// <returns>The month number (1-12).</returns>
        private static int GetMonthOrder(string month)
        {
            return month?.ToLower() switch
            {
                "january" => 1,
                "february" => 2,
                "march" => 3,
                "april" => 4,
                "may" => 5,
                "june" => 6,
                "july" => 7,
                "august" => 8,
                "september" => 9,
                "october" => 10,
                "november" => 11,
                "december" => 12,
                _ => 0
            };
        }
    }
}

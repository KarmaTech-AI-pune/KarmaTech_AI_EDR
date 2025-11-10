using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using NJS.Application.CQRS.WorkBreakdownStructures.Commands;
using NJS.Application.Dtos;
using NJS.Domain.Database;
using NJS.Domain.Entities;
using NJS.Domain.Enums;
using NJS.Repositories.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace NJS.Application.CQRS.WorkBreakdownStructures.Handlers
{
    public class CreateWBSVersionCommandHandler : IRequestHandler<CreateWBSVersionCommand, string>
    {
        private readonly ProjectManagementContext _context;
        private readonly IWBSVersionRepository _wbsVersionRepository;
        private readonly ILogger<CreateWBSVersionCommandHandler> _logger;

        public CreateWBSVersionCommandHandler(
            ProjectManagementContext context,
            IWBSVersionRepository wbsVersionRepository,
            ILogger<CreateWBSVersionCommandHandler> logger)
        {
            _context = context;
            _wbsVersionRepository = wbsVersionRepository;
            _logger = logger;
        }

        public async Task<string> Handle(CreateWBSVersionCommand request, CancellationToken cancellationToken)
        {
            try
            {
                // Get the current WBS for the project
                var wbs = await _context.WorkBreakdownStructures
                    .Include(w => w.Tasks)
                        .ThenInclude(t => t.PlannedHours)
                    .Include(w => w.Tasks)
                        .ThenInclude(t => t.UserWBSTasks)
                    .FirstOrDefaultAsync(w => w.ProjectId == request.ProjectId, cancellationToken);

                if (wbs == null)
                {
                    throw new InvalidOperationException($"WBS not found for project {request.ProjectId}");
                }

                // Generate next version number
                var nextVersion = await _wbsVersionRepository.GetNextVersionNumberAsync(request.ProjectId);

                // Create new WBS version
                var wbsVersion = new WBSVersionHistory
                {
                    WorkBreakdownStructureId = wbs.Id,
                    Version = nextVersion,
                    Comments = request.Comments,
                    CreatedBy = "system", // This should come from the current user context
                    StatusId = (int)PMWorkflowStatusEnum.Initial,
                    IsLatest = true,
                    IsActive = false // New versions are not active by default
                };

                // Deactivate all previous versions
                var existingVersions = await _wbsVersionRepository.GetByProjectIdAsync(request.ProjectId);
                foreach (var version in existingVersions.Where(v => v.IsLatest))
                {
                    version.IsLatest = false;
                    await _wbsVersionRepository.UpdateVersionAsync(version);
                }

                // Save the new version
                await _wbsVersionRepository.CreateVersionAsync(wbsVersion);

                // Copy tasks to version history
                await CopyTasksToVersion(wbs.Tasks, wbsVersion.Id, cancellationToken);

                // Update the WBS to point to the latest version
                wbs.LatestVersionHistoryId = wbsVersion.Id;
                wbs.CurrentVersion = nextVersion;
                _context.Entry(wbs).State = EntityState.Modified;
                await _context.SaveChangesAsync(cancellationToken);

                _logger.LogInformation($"Created WBS version {nextVersion} for project {request.ProjectId}");

                return nextVersion;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error creating WBS version for project {request.ProjectId}");
                throw;
            }
        }

        private async Task CopyTasksToVersion(ICollection<WBSTask> tasks, int wbsVersionHistoryId, CancellationToken cancellationToken)
        {
            var taskMap = new Dictionary<int, int>(); // Original task ID -> Version task ID

            // First pass: Create all tasks
            foreach (var task in tasks.OrderBy(t => t.DisplayOrder))
            {
                var taskVersion = new WBSTaskVersionHistory
                {
                    WBSVersionHistoryId = wbsVersionHistoryId,
                    OriginalTaskId = task.Id,
                    ParentId = null, // Will be updated in second pass
                    Level = task.Level,
                    Title = task.Title,
                    Description = task.Description,
                    DisplayOrder = task.DisplayOrder,
                    EstimatedBudget = task.EstimatedBudget,
                    StartDate = task.StartDate,
                    EndDate = task.EndDate,
                    TaskType = task.TaskType
                };

                await _wbsVersionRepository.CreateTaskVersionAsync(taskVersion);
                taskMap[task.Id] = taskVersion.Id;
            }

            // Second pass: Update parent relationships
            foreach (var task in tasks)
            {
                if (task.ParentId.HasValue && taskMap.ContainsKey(task.ParentId.Value))
                {
                    var taskVersion = await _wbsVersionRepository.GetTaskVersionByIdAsync(taskMap[task.Id]);
                    taskVersion.ParentId = taskMap[task.ParentId.Value];
                    await _wbsVersionRepository.UpdateTaskVersionAsync(taskVersion);
                }
            }

            // Copy planned hours and user assignments
            foreach (var task in tasks)
            {
                var taskVersion = await _wbsVersionRepository.GetTaskVersionByIdAsync(taskMap[task.Id]);
                
                // Copy planned hours
                foreach (var plannedHour in task.PlannedHours)
                {
                    var plannedHourVersion = new WBSTaskPlannedHourVersionHistory
                    {
                        WBSTaskVersionHistoryId = taskVersion.Id,
                        Year = plannedHour.Year,
                        Month = plannedHour.Month,
                        PlannedHours = plannedHour.PlannedHours,
                        CreatedBy = "system"
                    };
                    await _wbsVersionRepository.CreatePlannedHourVersionAsync(plannedHourVersion);
                }

                // Copy user assignments
                foreach (var userAssignment in task.UserWBSTasks)
                {
                    var userAssignmentVersion = new UserWBSTaskVersionHistory
                    {
                        WBSTaskVersionHistoryId = taskVersion.Id,
                        UserId = userAssignment.UserId,
                        ResourceRoleId = userAssignment.ResourceRoleId
                    };
                    await _wbsVersionRepository.CreateUserAssignmentVersionAsync(userAssignmentVersion);
                }
            }
        }
    }
} 
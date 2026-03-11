using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using EDR.Application.CQRS.WorkBreakdownStructures.Commands;
using EDR.Application.Dtos;
using EDR.Domain.Database;
using EDR.Domain.Entities;
using EDR.Domain.Enums;
using EDR.Repositories.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace EDR.Application.CQRS.WorkBreakdownStructures.Handlers
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
                    .Include(w => w.WBSHeader) // Eagerly load WBSHeader
                        .ThenInclude(h => h.Project) // Eagerly load Project
                    .Include(w => w.Tasks)
                        .ThenInclude(t => t.PlannedHours)
                    .Include(w => w.Tasks)
                        .ThenInclude(t => t.UserWBSTasks)
                    .FirstOrDefaultAsync(w => w.WBSHeader.ProjectId == request.ProjectId, cancellationToken);

                if (wbs == null || wbs.WBSHeader == null)
                {
                    throw new InvalidOperationException($"WBS or WBSHeader not found for project {request.ProjectId}");
                }

                // Generate next version number
                var nextVersion = await _wbsVersionRepository.GetNextVersionNumberAsync(request.ProjectId);

                // Create new WBS version
                var wbsVersion = new WBSVersionHistory
                {
                    WBSHeaderId = wbs.WBSHeaderId, // Link to WBSHeader
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

                // Initialize workflow history for the new version
                if (wbs.WBSHeader.Project != null)
                {
                    await InitializeVersionWorkflowHistoryAsync(wbsVersion, wbs.WBSHeader.Project);
                    await _context.SaveChangesAsync(cancellationToken);
                }

                // Copy tasks to version history
                await CopyTasksToVersion(wbs.Tasks, wbsVersion.Id, cancellationToken);

                // Update the WBSHeader to point to the latest version
                wbs.WBSHeader.LatestVersionHistoryId = wbsVersion.Id;
                wbs.WBSHeader.Version = nextVersion; // Update version on WBSHeader
                wbs.WBSHeader.ApprovalStatus = PMWorkflowStatusEnum.Initial; // Reset status for new version
                _context.Entry(wbs.WBSHeader).State = EntityState.Modified;
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
                    TenantId = _context.TenantId ?? 0,
                    WBSVersionHistoryId = wbsVersionHistoryId,
                    OriginalTaskId = task.Id,
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


            // Copy planned hours and user assignments
            foreach (var task in tasks)
            {
                var taskVersion = await _wbsVersionRepository.GetTaskVersionByIdAsync(taskMap[task.Id]);
                
                // Copy planned hours
                foreach (var plannedHour in task.PlannedHours)
                {
                    var plannedHourVersion = new WBSTaskPlannedHourVersionHistory
                    {
                        TenantId = _context.TenantId ?? 0,
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
                        TenantId = _context.TenantId ?? 0,
                        WBSTaskVersionHistoryId = taskVersion.Id,
                        UserId = userAssignment.UserId,
                        ResourceRoleId = userAssignment.ResourceRoleId
                    };
                    await _wbsVersionRepository.CreateUserAssignmentVersionAsync(userAssignmentVersion);
                }
            }
        }

        private async Task InitializeVersionWorkflowHistoryAsync(WBSVersionHistory versionHistory, Project project)
        {
            var actionDate = DateTime.UtcNow;

            async Task AddWorkflowHistoryAsync(string assignedToId)
            {
                if (!string.IsNullOrEmpty(assignedToId))
                {
                    var assignedUserExists = await _context.Users.AnyAsync(u => u.Id == assignedToId);
                    if (assignedUserExists)
                    {
                        var history = new WBSVersionWorkflowHistory
                        {
                            WBSVersionHistoryId = versionHistory.Id,
                            StatusId = (int)PMWorkflowStatusEnum.Initial,
                            Action = "Initial",
                            Comments = "WBS status has been initialized",
                            ActionDate = actionDate,
                            ActionBy = "system", // Should ideally use user context
                            AssignedToId = assignedToId,
                            TenantId = versionHistory.TenantId
                        };
                        _context.WBSVersionWorkflowHistories.Add(history);
                    }
                }
            }

            if (project != null)
            {
                await AddWorkflowHistoryAsync(project.ProjectManagerId);
                await AddWorkflowHistoryAsync(project.SeniorProjectManagerId);
                await AddWorkflowHistoryAsync(project.RegionalManagerId);
            }
        }
    }
}


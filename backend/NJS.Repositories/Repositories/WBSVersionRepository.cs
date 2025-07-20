using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using NJS.Domain.Database;
using NJS.Domain.Entities;
using NJS.Repositories.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace NJS.Repositories.Repositories
{
    public class WBSVersionRepository : IWBSVersionRepository
    {
        private readonly ProjectManagementContext _context;
        private readonly ILogger<WBSVersionRepository> _logger;

        public WBSVersionRepository(ProjectManagementContext context, ILogger<WBSVersionRepository> logger)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        #region WBS Version History operations

        public async Task<WBSVersionHistory> GetByIdAsync(int id)
        {
            return await _context.WBSVersionHistories
                .Include(w => w.Status)
                .Include(w => w.CreatedByUser)
                .Include(w => w.ApprovedByUser)
                .Include(w => w.WorkflowHistories.OrderByDescending(h => h.ActionDate))
                    .ThenInclude(h => h.Status)
                .Include(w => w.WorkflowHistories)
                    .ThenInclude(h => h.ActionUser)
                .Include(w => w.WorkflowHistories)
                    .ThenInclude(h => h.AssignedTo)
                .FirstOrDefaultAsync(w => w.Id == id);
        }

        public async Task<WBSVersionHistory> GetByVersionAsync(int projectId, string version)
        {
            return await _context.WBSVersionHistories
                .Include(w => w.Status)
                .Include(w => w.CreatedByUser)
                .Include(w => w.ApprovedByUser)
                .Include(w => w.WorkflowHistories.OrderByDescending(h => h.ActionDate))
                    .ThenInclude(h => h.Status)
                .Include(w => w.WorkflowHistories)
                    .ThenInclude(h => h.ActionUser)
                .Include(w => w.WorkflowHistories)
                    .ThenInclude(h => h.AssignedTo)
                .FirstOrDefaultAsync(w => w.WorkBreakdownStructure.ProjectId == projectId && w.Version == version);
        }

        public async Task<List<WBSVersionHistory>> GetByProjectIdAsync(int projectId)
        {
            return await _context.WBSVersionHistories
                .Include(w => w.Status)
                .Include(w => w.CreatedByUser)
                .Include(w => w.ApprovedByUser)
                .Include(w => w.WorkflowHistories.OrderByDescending(h => h.ActionDate))
                    .ThenInclude(h => h.Status)
                .Where(w => w.WorkBreakdownStructure.ProjectId == projectId)
                .OrderByDescending(w => w.CreatedAt)
                .ToListAsync();
        }

        public async Task<WBSVersionHistory> GetLatestVersionAsync(int projectId)
        {
            return await _context.WBSVersionHistories
                .Include(w => w.Status)
                .Include(w => w.CreatedByUser)
                .Include(w => w.ApprovedByUser)
                .Include(w => w.WorkflowHistories.OrderByDescending(h => h.ActionDate))
                    .ThenInclude(h => h.Status)
                .Where(w => w.WorkBreakdownStructure.ProjectId == projectId && w.IsLatest)
                .FirstOrDefaultAsync();
        }

        public async Task<WBSVersionHistory> GetActiveVersionAsync(int projectId)
        {
            return await _context.WBSVersionHistories
                .Include(w => w.Status)
                .Include(w => w.CreatedByUser)
                .Include(w => w.ApprovedByUser)
                .Include(w => w.WorkflowHistories.OrderByDescending(h => h.ActionDate))
                    .ThenInclude(h => h.Status)
                .Where(w => w.WorkBreakdownStructure.ProjectId == projectId && w.IsActive)
                .FirstOrDefaultAsync();
        }

        public async Task<WBSVersionHistory> CreateVersionAsync(WBSVersionHistory versionHistory)
        {
            _context.WBSVersionHistories.Add(versionHistory);
            await _context.SaveChangesAsync();
            return versionHistory;
        }

        public async Task<WBSVersionHistory> UpdateVersionAsync(WBSVersionHistory versionHistory)
        {
            _context.Entry(versionHistory).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return versionHistory;
        }

        public async Task<bool> DeleteVersionAsync(int projectId, string version)
        {
            var versionHistory = await GetByVersionAsync(projectId, version);
            if (versionHistory == null) return false;

            // Don't allow deletion of active version
            if (versionHistory.IsActive)
                throw new InvalidOperationException("Cannot delete active version");

            _context.WBSVersionHistories.Remove(versionHistory);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ActivateVersionAsync(int projectId, string version)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // Deactivate all versions for this project
                await DeactivateAllVersionsAsync(projectId);

                // Activate the specified version
                var versionHistory = await GetByVersionAsync(projectId, version);
                if (versionHistory == null) return false;

                versionHistory.IsActive = true;
                await UpdateVersionAsync(versionHistory);

                // Update the WorkBreakdownStructure to point to this version
                var wbs = await _context.WorkBreakdownStructures
                    .FirstOrDefaultAsync(w => w.ProjectId == projectId);
                if (wbs != null)
                {
                    wbs.ActiveVersionHistoryId = versionHistory.Id;
                    wbs.CurrentVersion = versionHistory.Version;
                    _context.Entry(wbs).State = EntityState.Modified;
                    await _context.SaveChangesAsync();
                }

                await transaction.CommitAsync();
                return true;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<bool> DeactivateAllVersionsAsync(int projectId)
        {
            var versions = await _context.WBSVersionHistories
                .Where(w => w.WorkBreakdownStructure.ProjectId == projectId && w.IsActive)
                .ToListAsync();

            foreach (var version in versions)
            {
                version.IsActive = false;
            }

            await _context.SaveChangesAsync();
            return true;
        }

        #endregion

        #region WBS Task Version History operations

        public async Task<List<WBSTaskVersionHistory>> GetTaskVersionsAsync(int wbsVersionHistoryId)
        {
            return await _context.WBSTaskVersionHistories
                .Include(t => t.PlannedHours)
                .Include(t => t.UserAssignments)
                    .ThenInclude(u => u.User)
                .Include(t => t.UserAssignments)
                    .ThenInclude(u => u.ResourceRole)
                .Where(t => t.WBSVersionHistoryId == wbsVersionHistoryId)
                .OrderBy(t => t.DisplayOrder)
                .ToListAsync();
        }

        public async Task<WBSTaskVersionHistory> GetTaskVersionByIdAsync(int id)
        {
            return await _context.WBSTaskVersionHistories
                .Include(t => t.PlannedHours)
                .Include(t => t.UserAssignments)
                    .ThenInclude(u => u.User)
                .Include(t => t.UserAssignments)
                    .ThenInclude(u => u.ResourceRole)
                .FirstOrDefaultAsync(t => t.Id == id);
        }

        public async Task<WBSTaskVersionHistory> CreateTaskVersionAsync(WBSTaskVersionHistory taskVersion)
        {
            _context.WBSTaskVersionHistories.Add(taskVersion);
            await _context.SaveChangesAsync();
            return taskVersion;
        }

        public async Task<WBSTaskVersionHistory> UpdateTaskVersionAsync(WBSTaskVersionHistory taskVersion)
        {
            _context.Entry(taskVersion).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return taskVersion;
        }

        public async Task<bool> DeleteTaskVersionsAsync(int wbsVersionHistoryId)
        {
            var taskVersions = await GetTaskVersionsAsync(wbsVersionHistoryId);
            _context.WBSTaskVersionHistories.RemoveRange(taskVersions);
            await _context.SaveChangesAsync();
            return true;
        }

        #endregion

        #region WBS Planned Hours Version History operations

        public async Task<WBSTaskPlannedHourVersionHistory> CreatePlannedHourVersionAsync(WBSTaskPlannedHourVersionHistory plannedHourVersion)
        {
            _context.WBSTaskPlannedHourVersionHistories.Add(plannedHourVersion);
            await _context.SaveChangesAsync();
            return plannedHourVersion;
        }

        public async Task<List<WBSTaskPlannedHourVersionHistory>> GetPlannedHourVersionsAsync(int wbsTaskVersionHistoryId)
        {
            return await _context.WBSTaskPlannedHourVersionHistories
                .Where(p => p.WBSTaskVersionHistoryId == wbsTaskVersionHistoryId)
                .OrderBy(p => p.Year)
                .ThenBy(p => p.Month)
                .ToListAsync();
        }

        public async Task<bool> DeletePlannedHourVersionsAsync(int wbsTaskVersionHistoryId)
        {
            var plannedHours = await GetPlannedHourVersionsAsync(wbsTaskVersionHistoryId);
            _context.WBSTaskPlannedHourVersionHistories.RemoveRange(plannedHours);
            await _context.SaveChangesAsync();
            return true;
        }

        #endregion

        #region User WBS Task Version History operations

        public async Task<UserWBSTaskVersionHistory> CreateUserAssignmentVersionAsync(UserWBSTaskVersionHistory userAssignmentVersion)
        {
            _context.UserWBSTaskVersionHistories.Add(userAssignmentVersion);
            await _context.SaveChangesAsync();
            return userAssignmentVersion;
        }

        public async Task<List<UserWBSTaskVersionHistory>> GetUserAssignmentVersionsAsync(int wbsTaskVersionHistoryId)
        {
            return await _context.UserWBSTaskVersionHistories
                .Include(u => u.User)
                .Include(u => u.ResourceRole)
                .Where(u => u.WBSTaskVersionHistoryId == wbsTaskVersionHistoryId)
                .ToListAsync();
        }

        public async Task<bool> DeleteUserAssignmentVersionsAsync(int wbsTaskVersionHistoryId)
        {
            var userAssignments = await GetUserAssignmentVersionsAsync(wbsTaskVersionHistoryId);
            _context.UserWBSTaskVersionHistories.RemoveRange(userAssignments);
            await _context.SaveChangesAsync();
            return true;
        }

        #endregion

        #region WBS Version Workflow History operations

        public async Task<List<WBSVersionWorkflowHistory>> GetWorkflowHistoryAsync(int wbsVersionHistoryId)
        {
            return await _context.WBSVersionWorkflowHistories
                .Include(h => h.Status)
                .Include(h => h.ActionUser)
                .Include(h => h.AssignedTo)
                .Where(h => h.WBSVersionHistoryId == wbsVersionHistoryId)
                .OrderByDescending(h => h.ActionDate)
                .ToListAsync();
        }

        public async Task<WBSVersionWorkflowHistory> CreateWorkflowHistoryAsync(WBSVersionWorkflowHistory workflowHistory)
        {
            _context.WBSVersionWorkflowHistories.Add(workflowHistory);
            await _context.SaveChangesAsync();
            return workflowHistory;
        }

        public async Task<WBSVersionWorkflowHistory> GetLatestWorkflowHistoryAsync(int wbsVersionHistoryId)
        {
            return await _context.WBSVersionWorkflowHistories
                .Include(h => h.Status)
                .Include(h => h.ActionUser)
                .Include(h => h.AssignedTo)
                .Where(h => h.WBSVersionHistoryId == wbsVersionHistoryId)
                .OrderByDescending(h => h.ActionDate)
                .FirstOrDefaultAsync();
        }

        #endregion

        #region Utility operations

        public async Task<string> GetNextVersionNumberAsync(int projectId)
        {
            var latestVersion = await _context.WBSVersionHistories
                .Where(w => w.WorkBreakdownStructure.ProjectId == projectId)
                .OrderByDescending(w => w.Version)
                .FirstOrDefaultAsync();

            if (latestVersion == null)
                return "1.0";

            if (decimal.TryParse(latestVersion.Version, out var version))
                return (version + 0.1m).ToString("F1");

            return latestVersion.Version + "_updated";
        }

        public async Task<bool> VersionExistsAsync(int projectId, string version)
        {
            return await _context.WBSVersionHistories
                .AnyAsync(w => w.WorkBreakdownStructure.ProjectId == projectId && w.Version == version);
        }

        public async Task<int> GetTaskCountAsync(int wbsVersionHistoryId)
        {
            return await _context.WBSTaskVersionHistories
                .CountAsync(t => t.WBSVersionHistoryId == wbsVersionHistoryId);
        }

        #endregion
    }
} 
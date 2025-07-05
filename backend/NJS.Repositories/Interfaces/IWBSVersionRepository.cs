using NJS.Domain.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace NJS.Repositories.Interfaces
{
    public interface IWBSVersionRepository
    {
        // WBS Version History operations
        Task<WBSVersionHistory> GetByIdAsync(int id);
        Task<WBSVersionHistory> GetByVersionAsync(int projectId, string version);
        Task<List<WBSVersionHistory>> GetByProjectIdAsync(int projectId);
        Task<WBSVersionHistory> GetLatestVersionAsync(int projectId);
        Task<WBSVersionHistory> GetActiveVersionAsync(int projectId);
        Task<WBSVersionHistory> CreateVersionAsync(WBSVersionHistory versionHistory);
        Task<WBSVersionHistory> UpdateVersionAsync(WBSVersionHistory versionHistory);
        Task<bool> DeleteVersionAsync(int projectId, string version);
        Task<bool> ActivateVersionAsync(int projectId, string version);
        Task<bool> DeactivateAllVersionsAsync(int projectId);

        // WBS Task Version History operations
        Task<List<WBSTaskVersionHistory>> GetTaskVersionsAsync(int wbsVersionHistoryId);
        Task<WBSTaskVersionHistory> GetTaskVersionByIdAsync(int id);
        Task<WBSTaskVersionHistory> CreateTaskVersionAsync(WBSTaskVersionHistory taskVersion);
        Task<bool> DeleteTaskVersionsAsync(int wbsVersionHistoryId);

        // WBS Version Workflow History operations
        Task<List<WBSVersionWorkflowHistory>> GetWorkflowHistoryAsync(int wbsVersionHistoryId);
        Task<WBSVersionWorkflowHistory> CreateWorkflowHistoryAsync(WBSVersionWorkflowHistory workflowHistory);
        Task<WBSVersionWorkflowHistory> GetLatestWorkflowHistoryAsync(int wbsVersionHistoryId);

        // Utility operations
        Task<string> GetNextVersionNumberAsync(int projectId);
        Task<bool> VersionExistsAsync(int projectId, string version);
        Task<int> GetTaskCountAsync(int wbsVersionHistoryId);
    }
} 
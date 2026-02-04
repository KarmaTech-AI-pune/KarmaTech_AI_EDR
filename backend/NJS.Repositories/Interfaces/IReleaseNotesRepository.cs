using NJS.Domain.Entities;

namespace NJS.Repositories.Interfaces
{
    /// <summary>
    /// Repository interface for managing release notes data
    /// </summary>
    public interface IReleaseNotesRepository
    {
        /// <summary>
        /// Gets all release notes ordered by release date descending
        /// </summary>
        Task<IEnumerable<ReleaseNotes>> GetAllAsync();

        /// <summary>
        /// Gets release notes by ID including change items
        /// </summary>
        Task<ReleaseNotes?> GetByIdAsync(int id);

        /// <summary>
        /// Gets release notes by version
        /// </summary>
        Task<ReleaseNotes?> GetByVersionAsync(string version);

        /// <summary>
        /// Gets release notes by environment with pagination
        /// </summary>
        Task<IEnumerable<ReleaseNotes>> GetByEnvironmentAsync(string environment, int skip = 0, int take = 10);

        /// <summary>
        /// Gets the latest release notes for a specific environment
        /// </summary>
        Task<ReleaseNotes?> GetLatestByEnvironmentAsync(string environment);

        /// <summary>
        /// Adds new release notes
        /// </summary>
        Task<ReleaseNotes> AddAsync(ReleaseNotes releaseNotes);

        /// <summary>
        /// Updates existing release notes
        /// </summary>
        Task UpdateAsync(ReleaseNotes releaseNotes);

        /// <summary>
        /// Deletes release notes by ID
        /// </summary>
        Task DeleteAsync(int id);

        /// <summary>
        /// Checks if release notes exist for a specific version
        /// </summary>
        Task<bool> ExistsAsync(string version);

        /// <summary>
        /// Searches release notes by criteria
        /// </summary>
        Task<IEnumerable<ReleaseNotes>> SearchAsync(string? searchTerm, string? environment, DateTime? fromDate, DateTime? toDate, int skip = 0, int take = 10);
    }
}
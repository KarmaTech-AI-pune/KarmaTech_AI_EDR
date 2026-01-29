namespace NJS.Application.Services.IContract
{
    /// <summary>
    /// Service for interacting with GitHub API and Git operations
    /// </summary>
    public interface IGitHubService
    {
        /// <summary>
        /// Gets commits between two Git references (tags, branches, commits)
        /// </summary>
        /// <param name="fromRef">Starting reference (e.g., previous tag)</param>
        /// <param name="toRef">Ending reference (e.g., current tag or HEAD)</param>
        /// <returns>List of commit information</returns>
        Task<IEnumerable<GitCommit>> GetCommitsBetweenReferencesAsync(string fromRef, string toRef);

        /// <summary>
        /// Gets commits for a specific GitHub tag
        /// </summary>
        /// <param name="tagName">GitHub tag name (e.g., v1.0.38-dev.20251223.1)</param>
        /// <returns>List of commits associated with the tag</returns>
        Task<IEnumerable<GitCommit>> GetCommitsForTagAsync(string tagName);

        /// <summary>
        /// Gets the latest GitHub tag for a specific branch
        /// </summary>
        /// <param name="branch">Branch name (e.g., Kiro/dev)</param>
        /// <returns>Latest tag name or null if no tags exist</returns>
        Task<string?> GetLatestTagAsync(string branch = "Kiro/dev");

        /// <summary>
        /// Validates if a GitHub tag exists
        /// </summary>
        /// <param name="tagName">Tag name to validate</param>
        /// <returns>True if tag exists, false otherwise</returns>
        Task<bool> TagExistsAsync(string tagName);

        /// <summary>
        /// Extracts version information from a GitHub tag
        /// </summary>
        /// <param name="tagName">GitHub tag (e.g., v1.0.38-dev.20251223.1)</param>
        /// <returns>Parsed tag information</returns>
        GitTagInfo ParseTagName(string tagName);
    }

    /// <summary>
    /// Represents a Git commit with relevant information
    /// </summary>
    public class GitCommit
    {
        public string Sha { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public string Author { get; set; } = string.Empty;
        public DateTime Date { get; set; }
        public string Url { get; set; } = string.Empty;
    }

    /// <summary>
    /// Represents parsed GitHub tag information
    /// </summary>
    public class GitTagInfo
    {
        public string FullTag { get; set; } = string.Empty;
        public string Version { get; set; } = string.Empty; // e.g., 1.0.38
        public string Environment { get; set; } = string.Empty; // e.g., dev, prod
        public DateTime? BuildDate { get; set; } // e.g., 20251223
        public int? BuildNumber { get; set; } // e.g., 1
        public bool IsValid { get; set; }
    }
}
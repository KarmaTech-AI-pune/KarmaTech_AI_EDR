using EDR.Domain.Entities;

namespace EDR.Application.Services.IContract
{
    /// <summary>
    /// Service for generating release notes from Git commits and GitHub tags
    /// </summary>
    public interface IReleaseNotesGeneratorService
    {
        /// <summary>
        /// Parses a commit message and extracts structured information
        /// </summary>
        /// <param name="commitMessage">The commit message to parse</param>
        /// <param name="commitSha">The commit SHA</param>
        /// <param name="author">The commit author</param>
        /// <returns>Parsed commit information</returns>
        Task<ParsedCommit> ParseCommitMessageAsync(string commitMessage, string commitSha, string author);

        /// <summary>
        /// Categorizes a list of commits into different change types
        /// </summary>
        /// <param name="commits">List of parsed commits</param>
        /// <returns>Categorized commits</returns>
        Task<CategorizedCommits> CategorizeCommitsAsync(IEnumerable<ParsedCommit> commits);

        /// <summary>
        /// Extracts JIRA ticket references from a commit message
        /// </summary>
        /// <param name="commitMessage">The commit message to analyze</param>
        /// <returns>JIRA ticket reference if found, null otherwise</returns>
        string? ExtractJiraReference(string commitMessage);

        /// <summary>
        /// Generates release notes from a list of commits
        /// </summary>
        /// <param name="commits">List of commits to process</param>
        /// <param name="version">Version tag for the release</param>
        /// <param name="environment">Environment (dev, staging, prod)</param>
        /// <param name="branch">Git branch name</param>
        /// <returns>Generated release notes entity</returns>
        Task<ReleaseNotes> GenerateReleaseNotesAsync(IEnumerable<ParsedCommit> commits, string version, string environment, string branch);

        /// <summary>
        /// Generates and stores release notes for a GitHub tag
        /// </summary>
        /// <param name="tagName">GitHub tag name (e.g., v1.0.38-dev.20251223.1)</param>
        /// <param name="branch">Git branch name</param>
        /// <returns>Generated and stored release notes entity</returns>
        Task<ReleaseNotes> GenerateReleaseNotesForTagAsync(string tagName, string branch = "Kiro/dev");

        /// <summary>
        /// Generates and stores release notes for the latest tag on a branch
        /// </summary>
        /// <param name="branch">Git branch name</param>
        /// <returns>Generated and stored release notes entity, or null if no tags exist</returns>
        Task<ReleaseNotes?> GenerateReleaseNotesForLatestTagAsync(string branch = "Kiro/dev");
    }

    /// <summary>
    /// Represents a parsed commit with structured information
    /// </summary>
    public class ParsedCommit
    {
        public string CommitSha { get; set; } = string.Empty;
        public string Author { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty; // feat, fix, docs, etc.
        public string Scope { get; set; } = string.Empty; // optional scope in parentheses
        public string Description { get; set; } = string.Empty;
        public string? JiraTicket { get; set; }
        public bool IsBreakingChange { get; set; }
        public string Impact { get; set; } = "Medium"; // Low, Medium, High
    }

    /// <summary>
    /// Represents commits categorized by change type
    /// </summary>
    public class CategorizedCommits
    {
        public List<ParsedCommit> Features { get; set; } = new();
        public List<ParsedCommit> BugFixes { get; set; } = new();
        public List<ParsedCommit> Improvements { get; set; } = new();
        public List<ParsedCommit> BreakingChanges { get; set; } = new();
        public List<ParsedCommit> Documentation { get; set; } = new();
        public List<ParsedCommit> Other { get; set; } = new();
    }
}

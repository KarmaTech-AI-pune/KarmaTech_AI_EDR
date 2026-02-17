using Microsoft.Extensions.Logging;
using EDR.Application.Services.IContract;
using EDR.Domain.Entities;
using EDR.Repositories.Interfaces;
using System.Text.RegularExpressions;

namespace EDR.Application.Services
{
    /// <summary>
    /// Service for generating release notes from Git commits and GitHub tags
    /// </summary>
    public class ReleaseNotesGeneratorService : IReleaseNotesGeneratorService
    {
        private readonly ILogger<ReleaseNotesGeneratorService> _logger;
        private readonly IGitHubService _gitHubService;
        private readonly IReleaseNotesRepository _releaseNotesRepository;

        // Regex patterns for parsing conventional commits
        private static readonly Regex ConventionalCommitRegex = new(
            @"^(?<type>\w+)(?:\((?<scope>[^)]+)\))?(?<breaking>!)?: (?<description>.+)$",
            RegexOptions.Compiled | RegexOptions.IgnoreCase
        );

        // Regex pattern for JIRA ticket references
        private static readonly Regex JiraTicketRegex = new(
            @"\b([A-Z]{2,10}-\d+)\b",
            RegexOptions.Compiled | RegexOptions.IgnoreCase
        );

        // Mapping of conventional commit types to change categories
        private static readonly Dictionary<string, string> CommitTypeMapping = new(StringComparer.OrdinalIgnoreCase)
        {
            { "feat", "Feature" },
            { "feature", "Feature" },
            { "fix", "BugFix" },
            { "bugfix", "BugFix" },
            { "perf", "Improvement" },
            { "refactor", "Improvement" },
            { "style", "Improvement" },
            { "test", "Improvement" },
            { "build", "Improvement" },
            { "ci", "Improvement" },
            { "chore", "Improvement" },
            { "docs", "Documentation" },
            { "doc", "Documentation" }
        };

        public ReleaseNotesGeneratorService(
            ILogger<ReleaseNotesGeneratorService> logger,
            IGitHubService gitHubService,
            IReleaseNotesRepository releaseNotesRepository)
        {
            _logger = logger;
            _gitHubService = gitHubService;
            _releaseNotesRepository = releaseNotesRepository;
        }

        public async Task<ParsedCommit> ParseCommitMessageAsync(string commitMessage, string commitSha, string author)
        {
            if (string.IsNullOrWhiteSpace(commitMessage))
            {
                _logger.LogWarning("Empty commit message for SHA: {CommitSha}", commitSha);
                return CreateDefaultParsedCommit(commitMessage, commitSha, author);
            }

            var parsedCommit = new ParsedCommit
            {
                CommitSha = commitSha,
                Author = author,
                Message = commitMessage.Trim()
            };

            // Try to parse as conventional commit
            var match = ConventionalCommitRegex.Match(commitMessage);
            if (match.Success)
            {
                parsedCommit.Type = match.Groups["type"].Value.ToLowerInvariant();
                parsedCommit.Scope = match.Groups["scope"].Value;
                parsedCommit.Description = match.Groups["description"].Value.Trim();
                parsedCommit.IsBreakingChange = match.Groups["breaking"].Success;
            }
            else
            {
                // Handle non-conventional commits
                parsedCommit.Type = "other";
                parsedCommit.Description = commitMessage.Trim();
                
                // Try to infer type from commit message content
                var inferredType = InferCommitType(commitMessage);
                if (!string.IsNullOrEmpty(inferredType))
                {
                    parsedCommit.Type = inferredType;
                }
            }

            // Extract JIRA ticket reference
            parsedCommit.JiraTicket = ExtractJiraReference(commitMessage);

            // Determine impact level
            parsedCommit.Impact = DetermineImpactLevel(parsedCommit);

            _logger.LogDebug("Parsed commit {CommitSha}: Type={Type}, Description={Description}", 
                commitSha, parsedCommit.Type, parsedCommit.Description);

            return await Task.FromResult(parsedCommit);
        }

        public async Task<CategorizedCommits> CategorizeCommitsAsync(IEnumerable<ParsedCommit> commits)
        {
            var categorized = new CategorizedCommits();

            foreach (var commit in commits)
            {
                // Handle breaking changes first (they take precedence)
                if (commit.IsBreakingChange)
                {
                    categorized.BreakingChanges.Add(commit);
                    continue;
                }

                // Categorize based on commit type
                var category = GetCommitCategory(commit.Type);
                switch (category)
                {
                    case "Feature":
                        categorized.Features.Add(commit);
                        break;
                    case "BugFix":
                        categorized.BugFixes.Add(commit);
                        break;
                    case "Improvement":
                        categorized.Improvements.Add(commit);
                        break;
                    case "Documentation":
                        categorized.Documentation.Add(commit);
                        break;
                    default:
                        categorized.Other.Add(commit);
                        break;
                }
            }

            _logger.LogInformation("Categorized {TotalCommits} commits: Features={Features}, BugFixes={BugFixes}, Improvements={Improvements}, Breaking={Breaking}, Docs={Docs}, Other={Other}",
                commits.Count(), categorized.Features.Count, categorized.BugFixes.Count, 
                categorized.Improvements.Count, categorized.BreakingChanges.Count, 
                categorized.Documentation.Count, categorized.Other.Count);

            return await Task.FromResult(categorized);
        }

        public string? ExtractJiraReference(string commitMessage)
        {
            if (string.IsNullOrWhiteSpace(commitMessage))
                return null;

            var match = JiraTicketRegex.Match(commitMessage);
            return match.Success ? match.Groups[1].Value.ToUpperInvariant() : null;
        }

        public async Task<ReleaseNotes> GenerateReleaseNotesAsync(IEnumerable<ParsedCommit> commits, string version, string environment, string branch)
        {
            var categorized = await CategorizeCommitsAsync(commits);
            
            var releaseNotes = new ReleaseNotes
            {
                Version = version,
                ReleaseDate = DateTime.UtcNow,
                Environment = environment,
                Branch = branch,
                CommitSha = commits.FirstOrDefault()?.CommitSha ?? string.Empty,
                CreatedDate = DateTime.UtcNow,
                ChangeItems = new List<ChangeItem>()
            };

            // Add features
            foreach (var commit in categorized.Features)
            {
                releaseNotes.ChangeItems.Add(CreateChangeItem(commit, "Feature"));
            }

            // Add bug fixes
            foreach (var commit in categorized.BugFixes)
            {
                releaseNotes.ChangeItems.Add(CreateChangeItem(commit, "BugFix"));
            }

            // Add improvements
            foreach (var commit in categorized.Improvements)
            {
                releaseNotes.ChangeItems.Add(CreateChangeItem(commit, "Improvement"));
            }

            // Add breaking changes
            foreach (var commit in categorized.BreakingChanges)
            {
                releaseNotes.ChangeItems.Add(CreateChangeItem(commit, "Breaking"));
            }

            // Add documentation changes (if significant)
            foreach (var commit in categorized.Documentation.Where(c => IsSignificantDocChange(c)))
            {
                releaseNotes.ChangeItems.Add(CreateChangeItem(commit, "Documentation"));
            }

            // Add other significant changes
            foreach (var commit in categorized.Other.Where(c => IsSignificantChange(c)))
            {
                releaseNotes.ChangeItems.Add(CreateChangeItem(commit, "Other"));
            }

            _logger.LogInformation("Generated release notes for version {Version} with {ChangeCount} changes", 
                version, releaseNotes.ChangeItems.Count);

            return releaseNotes;
        }

        public async Task<ReleaseNotes> GenerateReleaseNotesForTagAsync(string tagName, string branch = "Kiro/dev")
        {
            _logger.LogInformation("Generating release notes for tag {TagName} on branch {Branch}", tagName, branch);

            // Check if release notes already exist for this version
            var existingReleaseNotes = await _releaseNotesRepository.GetByVersionAsync(tagName);
            if (existingReleaseNotes != null)
            {
                _logger.LogInformation("Release notes already exist for version {Version}", tagName);
                return existingReleaseNotes;
            }

            // Parse tag information
            var tagInfo = _gitHubService.ParseTagName(tagName);
            if (!tagInfo.IsValid)
            {
                throw new ArgumentException($"Invalid tag format: {tagName}", nameof(tagName));
            }

            // Verify tag exists
            var tagExists = await _gitHubService.TagExistsAsync(tagName);
            if (!tagExists)
            {
                throw new ArgumentException($"Tag does not exist: {tagName}", nameof(tagName));
            }

            // Get commits for the tag
            var gitCommits = await _gitHubService.GetCommitsForTagAsync(tagName);
            
            // Convert Git commits to ParsedCommits
            var parsedCommits = new List<ParsedCommit>();
            foreach (var gitCommit in gitCommits)
            {
                var parsedCommit = await ParseCommitMessageAsync(gitCommit.Message, gitCommit.Sha, gitCommit.Author);
                parsedCommits.Add(parsedCommit);
            }

            // Generate release notes
            var releaseNotes = await GenerateReleaseNotesAsync(parsedCommits, tagName, tagInfo.Environment, branch);

            // Store in database
            var storedReleaseNotes = await _releaseNotesRepository.AddAsync(releaseNotes);

            _logger.LogInformation("Successfully generated and stored release notes for tag {TagName} with {ChangeCount} changes", 
                tagName, storedReleaseNotes.ChangeItems.Count);

            return storedReleaseNotes;
        }

        public async Task<ReleaseNotes?> GenerateReleaseNotesForLatestTagAsync(string branch = "Kiro/dev")
        {
            _logger.LogInformation("Generating release notes for latest tag on branch {Branch}", branch);

            // Get the latest tag
            var latestTag = await _gitHubService.GetLatestTagAsync(branch);
            if (string.IsNullOrEmpty(latestTag))
            {
                _logger.LogWarning("No tags found on branch {Branch}", branch);
                return null;
            }

            // Generate release notes for the latest tag
            return await GenerateReleaseNotesForTagAsync(latestTag, branch);
        }

        private ParsedCommit CreateDefaultParsedCommit(string commitMessage, string commitSha, string author)
        {
            return new ParsedCommit
            {
                CommitSha = commitSha,
                Author = author,
                Message = commitMessage ?? string.Empty,
                Type = "other",
                Description = commitMessage?.Trim() ?? "No commit message",
                Impact = "Low"
            };
        }

        private string InferCommitType(string commitMessage)
        {
            var lowerMessage = commitMessage.ToLowerInvariant();

            // Check for common patterns
            if (lowerMessage.Contains("fix") || lowerMessage.Contains("bug") || lowerMessage.Contains("issue"))
                return "fix";
            
            if (lowerMessage.Contains("add") || lowerMessage.Contains("implement") || lowerMessage.Contains("create"))
                return "feat";
            
            if (lowerMessage.Contains("update") || lowerMessage.Contains("improve") || lowerMessage.Contains("enhance"))
                return "refactor";
            
            if (lowerMessage.Contains("doc") || lowerMessage.Contains("readme"))
                return "docs";

            return "other";
        }

        private string DetermineImpactLevel(ParsedCommit commit)
        {
            // Breaking changes are always high impact
            if (commit.IsBreakingChange)
                return "High";

            // Features are typically medium to high impact
            if (commit.Type == "feat" || commit.Type == "feature")
                return "Medium";

            // Bug fixes can be high impact depending on severity
            if (commit.Type == "fix" || commit.Type == "bugfix")
            {
                var lowerDescription = commit.Description.ToLowerInvariant();
                if (lowerDescription.Contains("critical") || lowerDescription.Contains("security") || 
                    lowerDescription.Contains("crash") || lowerDescription.Contains("data loss"))
                    return "High";
                
                return "Medium";
            }

            // Performance improvements can be medium impact
            if (commit.Type == "perf")
                return "Medium";

            // Documentation, style, and other changes are typically low impact
            return "Low";
        }

        private string GetCommitCategory(string commitType)
        {
            return CommitTypeMapping.TryGetValue(commitType, out var category) ? category : "Other";
        }

        private ChangeItem CreateChangeItem(ParsedCommit commit, string changeType)
        {
            return new ChangeItem
            {
                ChangeType = changeType,
                Description = FormatDescription(commit),
                CommitSha = commit.CommitSha,
                JiraTicket = commit.JiraTicket,
                Impact = commit.Impact,
                Author = commit.Author
            };
        }

        private string FormatDescription(ParsedCommit commit)
        {
            var description = commit.Description;

            // Add scope if available
            if (!string.IsNullOrEmpty(commit.Scope))
            {
                description = $"({commit.Scope}) {description}";
            }

            // Ensure first letter is capitalized
            if (!string.IsNullOrEmpty(description))
            {
                description = char.ToUpperInvariant(description[0]) + description.Substring(1);
            }

            return description;
        }

        private bool IsSignificantDocChange(ParsedCommit commit)
        {
            var lowerDescription = commit.Description.ToLowerInvariant();
            
            // Consider significant if it's API documentation, user guides, or major updates
            return lowerDescription.Contains("api") || 
                   lowerDescription.Contains("guide") || 
                   lowerDescription.Contains("tutorial") ||
                   lowerDescription.Contains("breaking") ||
                   lowerDescription.Contains("migration");
        }

        private bool IsSignificantChange(ParsedCommit commit)
        {
            var lowerDescription = commit.Description.ToLowerInvariant();
            
            // Filter out merge commits and trivial changes
            if (lowerDescription.StartsWith("merge") || 
                lowerDescription.Contains("typo") ||
                lowerDescription.Contains("whitespace") ||
                lowerDescription.Contains("formatting"))
                return false;

            // Include changes that seem significant
            return lowerDescription.Contains("update") ||
                   lowerDescription.Contains("change") ||
                   lowerDescription.Contains("modify") ||
                   lowerDescription.Contains("remove") ||
                   lowerDescription.Contains("delete");
        }
    }
}

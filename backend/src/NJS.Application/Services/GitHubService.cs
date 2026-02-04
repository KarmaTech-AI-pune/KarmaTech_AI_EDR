using Microsoft.Extensions.Logging;
using NJS.Application.Services.IContract;
using System.Diagnostics;
using System.Text.RegularExpressions;

namespace NJS.Application.Services
{
    /// <summary>
    /// Service for interacting with GitHub API and Git operations
    /// </summary>
    public class GitHubService : IGitHubService
    {
        private readonly ILogger<GitHubService> _logger;

        // Regex pattern for parsing GitHub tags (e.g., v1.0.38-dev.20251223.1)
        private static readonly Regex TagRegex = new(
            @"^v?(?<version>\d+\.\d+\.\d+)(?:-(?<env>\w+))?(?:\.(?<date>\d{8}))?(?:\.(?<build>\d+))?$",
            RegexOptions.Compiled | RegexOptions.IgnoreCase
        );

        public GitHubService(ILogger<GitHubService> logger)
        {
            _logger = logger;
        }

        public async Task<IEnumerable<GitCommit>> GetCommitsBetweenReferencesAsync(string fromRef, string toRef)
        {
            try
            {
                // Use git log to get commits between references
                var gitCommand = $"log --oneline --pretty=format:\"%H|%an|%ad|%s\" --date=iso {fromRef}..{toRef}";
                var output = await ExecuteGitCommandAsync(gitCommand);

                return ParseGitLogOutput(output);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to get commits between {FromRef} and {ToRef}", fromRef, toRef);
                return Enumerable.Empty<GitCommit>();
            }
        }

        public async Task<IEnumerable<GitCommit>> GetCommitsForTagAsync(string tagName)
        {
            try
            {
                // Get the previous tag to compare against
                var previousTag = await GetPreviousTagAsync(tagName);
                
                if (string.IsNullOrEmpty(previousTag))
                {
                    // If no previous tag, get all commits up to this tag
                    var gitCommand = $"log --oneline --pretty=format:\"%H|%an|%ad|%s\" --date=iso {tagName}";
                    var output = await ExecuteGitCommandAsync(gitCommand);
                    return ParseGitLogOutput(output).Take(50); // Limit to last 50 commits
                }
                else
                {
                    // Get commits between previous tag and current tag
                    return await GetCommitsBetweenReferencesAsync(previousTag, tagName);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to get commits for tag {TagName}", tagName);
                return Enumerable.Empty<GitCommit>();
            }
        }

        public async Task<string?> GetLatestTagAsync(string branch = "Kiro/dev")
        {
            try
            {
                // Get the latest tag on the specified branch
                var gitCommand = $"describe --tags --abbrev=0 {branch}";
                var output = await ExecuteGitCommandAsync(gitCommand);
                
                return string.IsNullOrWhiteSpace(output) ? null : output.Trim();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to get latest tag for branch {Branch}", branch);
                return null;
            }
        }

        public async Task<bool> TagExistsAsync(string tagName)
        {
            try
            {
                var gitCommand = $"tag -l {tagName}";
                var output = await ExecuteGitCommandAsync(gitCommand);
                
                return !string.IsNullOrWhiteSpace(output);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to check if tag {TagName} exists", tagName);
                return false;
            }
        }

        public GitTagInfo ParseTagName(string tagName)
        {
            var tagInfo = new GitTagInfo
            {
                FullTag = tagName,
                IsValid = false
            };

            if (string.IsNullOrWhiteSpace(tagName))
            {
                return tagInfo;
            }

            var match = TagRegex.Match(tagName);
            if (!match.Success)
            {
                _logger.LogWarning("Invalid tag format: {TagName}", tagName);
                return tagInfo;
            }

            tagInfo.Version = match.Groups["version"].Value;
            tagInfo.Environment = match.Groups["env"].Value;
            
            // Parse build date if present
            if (match.Groups["date"].Success && DateTime.TryParseExact(
                match.Groups["date"].Value, "yyyyMMdd", null, 
                System.Globalization.DateTimeStyles.None, out var buildDate))
            {
                tagInfo.BuildDate = buildDate;
            }

            // Parse build number if present
            if (match.Groups["build"].Success && int.TryParse(match.Groups["build"].Value, out var buildNumber))
            {
                tagInfo.BuildNumber = buildNumber;
            }

            // Default environment to "prod" if not specified
            if (string.IsNullOrEmpty(tagInfo.Environment))
            {
                tagInfo.Environment = "prod";
            }

            tagInfo.IsValid = true;
            return tagInfo;
        }

        private async Task<string?> GetPreviousTagAsync(string currentTag)
        {
            try
            {
                // Get all tags sorted by version, then find the one before current
                var gitCommand = "tag --sort=-version:refname";
                var output = await ExecuteGitCommandAsync(gitCommand);
                
                var tags = output.Split('\n', StringSplitOptions.RemoveEmptyEntries);
                var currentIndex = Array.IndexOf(tags, currentTag);
                
                if (currentIndex > 0 && currentIndex < tags.Length - 1)
                {
                    return tags[currentIndex + 1];
                }
                
                return null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to get previous tag for {CurrentTag}", currentTag);
                return null;
            }
        }

        private async Task<string> ExecuteGitCommandAsync(string command)
        {
            var processInfo = new ProcessStartInfo
            {
                FileName = "git",
                Arguments = command,
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                UseShellExecute = false,
                CreateNoWindow = true
            };

            using var process = Process.Start(processInfo);
            if (process == null)
            {
                throw new InvalidOperationException("Failed to start git process");
            }

            var output = await process.StandardOutput.ReadToEndAsync();
            var error = await process.StandardError.ReadToEndAsync();
            
            await process.WaitForExitAsync();

            if (process.ExitCode != 0)
            {
                throw new InvalidOperationException($"Git command failed: {error}");
            }

            return output;
        }

        private IEnumerable<GitCommit> ParseGitLogOutput(string output)
        {
            if (string.IsNullOrWhiteSpace(output))
            {
                return Enumerable.Empty<GitCommit>();
            }

            var commits = new List<GitCommit>();
            var lines = output.Split('\n', StringSplitOptions.RemoveEmptyEntries);

            foreach (var line in lines)
            {
                var parts = line.Split('|', 4);
                if (parts.Length >= 4)
                {
                    var commit = new GitCommit
                    {
                        Sha = parts[0].Trim(),
                        Author = parts[1].Trim(),
                        Message = parts[3].Trim()
                    };

                    if (DateTime.TryParse(parts[2].Trim(), out var date))
                    {
                        commit.Date = date;
                    }

                    commits.Add(commit);
                }
            }

            return commits;
        }
    }
}
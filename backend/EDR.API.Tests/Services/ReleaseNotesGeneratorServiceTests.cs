using Microsoft.Extensions.Logging;
using Moq;
using EDR.Application.Services;
using EDR.Application.Services.IContract;
using EDR.Domain.Entities;
using EDR.Repositories.Interfaces;
using Xunit;

namespace EDR.API.Tests.Services
{
    public class ReleaseNotesGeneratorServiceTests
    {
        private readonly Mock<ILogger<ReleaseNotesGeneratorService>> _loggerMock;
        private readonly Mock<IGitHubService> _gitHubServiceMock;
        private readonly Mock<IReleaseNotesRepository> _releaseNotesRepositoryMock;
        private readonly ReleaseNotesGeneratorService _service;

        public ReleaseNotesGeneratorServiceTests()
        {
            _loggerMock = new Mock<ILogger<ReleaseNotesGeneratorService>>();
            _gitHubServiceMock = new Mock<IGitHubService>();
            _releaseNotesRepositoryMock = new Mock<IReleaseNotesRepository>();
            
            _service = new ReleaseNotesGeneratorService(
                _loggerMock.Object,
                _gitHubServiceMock.Object,
                _releaseNotesRepositoryMock.Object);
        }

        [Fact]
        public async Task ParseCommitMessageAsync_ConventionalCommit_ParsesCorrectly()
        {
            // Arrange
            var commitMessage = "feat(auth): add user authentication EDR-123";
            var commitSha = "abc123";
            var author = "test@example.com";

            // Act
            var result = await _service.ParseCommitMessageAsync(commitMessage, commitSha, author);

            // Assert
            Assert.Equal("feat", result.Type);
            Assert.Equal("auth", result.Scope);
            Assert.Equal("add user authentication EDR-123", result.Description);
            Assert.Equal("EDR-123", result.JiraTicket);
            Assert.Equal(commitSha, result.CommitSha);
            Assert.Equal(author, result.Author);
            Assert.False(result.IsBreakingChange);
        }

        [Fact]
        public async Task ParseCommitMessageAsync_BreakingChange_ParsesCorrectly()
        {
            // Arrange
            var commitMessage = "feat!: breaking change in API";
            var commitSha = "def456";
            var author = "dev@example.com";

            // Act
            var result = await _service.ParseCommitMessageAsync(commitMessage, commitSha, author);

            // Assert
            Assert.Equal("feat", result.Type);
            Assert.Equal("breaking change in API", result.Description);
            Assert.True(result.IsBreakingChange);
            Assert.Equal("High", result.Impact);
        }

        [Fact]
        public async Task CategorizeCommitsAsync_VariousCommitTypes_CategorizedCorrectly()
        {
            // Arrange
            var commits = new List<ParsedCommit>
            {
                new() { Type = "feat", Description = "Add new feature", IsBreakingChange = false },
                new() { Type = "fix", Description = "Fix bug", IsBreakingChange = false },
                new() { Type = "docs", Description = "Update docs", IsBreakingChange = false },
                new() { Type = "feat", Description = "Breaking change", IsBreakingChange = true }
            };

            // Act
            var result = await _service.CategorizeCommitsAsync(commits);

            // Assert
            Assert.Single(result.Features);
            Assert.Single(result.BugFixes);
            Assert.Single(result.Documentation);
            Assert.Single(result.BreakingChanges);
            Assert.Empty(result.Improvements);
            Assert.Empty(result.Other);
        }

        [Fact]
        public async Task GenerateReleaseNotesAsync_ValidCommits_GeneratesCorrectStructure()
        {
            // Arrange
            var commits = new List<ParsedCommit>
            {
                new() 
                { 
                    Type = "feat", 
                    Description = "Add authentication", 
                    CommitSha = "abc123",
                    Author = "dev@example.com",
                    JiraTicket = "EDR-123",
                    Impact = "Medium"
                },
                new() 
                { 
                    Type = "fix", 
                    Description = "Fix login bug", 
                    CommitSha = "def456",
                    Author = "dev@example.com",
                    Impact = "High"
                }
            };

            var version = "v1.0.0-dev.20251223.1";
            var environment = "dev";
            var branch = "Kiro/dev";

            // Act
            var result = await _service.GenerateReleaseNotesAsync(commits, version, environment, branch);

            // Assert
            Assert.Equal(version, result.Version);
            Assert.Equal(environment, result.Environment);
            Assert.Equal(branch, result.Branch);
            Assert.Equal(2, result.ChangeItems.Count);
            
            var featureItem = result.ChangeItems.First(ci => ci.ChangeType == "Feature");
            Assert.Equal("Add authentication", featureItem.Description);
            Assert.Equal("EDR-123", featureItem.JiraTicket);
            Assert.Equal("Medium", featureItem.Impact);

            var bugFixItem = result.ChangeItems.First(ci => ci.ChangeType == "BugFix");
            Assert.Equal("Fix login bug", bugFixItem.Description);
            Assert.Equal("High", bugFixItem.Impact);
        }

        [Fact]
        public async Task GenerateReleaseNotesForTagAsync_ExistingReleaseNotes_ReturnsExisting()
        {
            // Arrange
            var tagName = "v1.0.0-dev.20251223.1";
            var existingReleaseNotes = new ReleaseNotes { Version = tagName };
            
            _releaseNotesRepositoryMock
                .Setup(r => r.GetByVersionAsync(tagName))
                .ReturnsAsync(existingReleaseNotes);

            // Act
            var result = await _service.GenerateReleaseNotesForTagAsync(tagName);

            // Assert
            Assert.Equal(existingReleaseNotes, result);
            _gitHubServiceMock.Verify(g => g.ParseTagName(It.IsAny<string>()), Times.Never);
        }

        [Theory]
        [InlineData("invalid-tag")]
        [InlineData("")]
        [InlineData("not-a-version")]
        public async Task GenerateReleaseNotesForTagAsync_InvalidTag_ThrowsArgumentException(string invalidTag)
        {
            // Arrange
            _releaseNotesRepositoryMock
                .Setup(r => r.GetByVersionAsync(invalidTag))
                .ReturnsAsync((ReleaseNotes?)null);

            _gitHubServiceMock
                .Setup(g => g.ParseTagName(invalidTag))
                .Returns(new GitTagInfo { IsValid = false });

            // Act & Assert
            await Assert.ThrowsAsync<ArgumentException>(() => 
                _service.GenerateReleaseNotesForTagAsync(invalidTag));
        }

        [Fact]
        public void ExtractJiraReference_ValidTicket_ExtractsCorrectly()
        {
            // Arrange
            var commitMessage = "feat: add feature for EDR-123 and fix issue";

            // Act
            var result = _service.ExtractJiraReference(commitMessage);

            // Assert
            Assert.Equal("EDR-123", result);
        }

        [Fact]
        public void ExtractJiraReference_NoTicket_ReturnsNull()
        {
            // Arrange
            var commitMessage = "feat: add feature without ticket";

            // Act
            var result = _service.ExtractJiraReference(commitMessage);

            // Assert
            Assert.Null(result);
        }
    }
}

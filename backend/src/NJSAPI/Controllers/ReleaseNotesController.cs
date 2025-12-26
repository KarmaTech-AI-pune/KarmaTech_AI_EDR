using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using NJS.Application.Services.IContract;
using NJS.Domain.Entities;
using NJS.Repositories.Interfaces;

namespace NJSAPI.Controllers
{
    /// <summary>
    /// API Controller for managing release notes
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    public class ReleaseNotesController : ControllerBase
    {
        private readonly IReleaseNotesGeneratorService _releaseNotesGeneratorService;
        private readonly IReleaseNotesRepository _releaseNotesRepository;
        private readonly IMemoryCache _cache;
        private readonly ILogger<ReleaseNotesController> _logger;

        // Cache keys
        private const string CURRENT_RELEASE_CACHE_KEY = "current_release_notes_{0}";
        private const string VERSION_RELEASE_CACHE_KEY = "version_release_notes_{0}";
        private const string RELEASE_HISTORY_CACHE_KEY = "release_history_{0}_{1}_{2}";
        private const string SEARCH_CACHE_KEY = "search_release_notes_{0}_{1}_{2}_{3}_{4}_{5}";

        // Cache expiration times
        private static readonly TimeSpan CurrentReleaseCacheExpiration = TimeSpan.FromMinutes(30);
        private static readonly TimeSpan VersionReleaseCacheExpiration = TimeSpan.FromHours(24);
        private static readonly TimeSpan HistoryCacheExpiration = TimeSpan.FromMinutes(15);
        private static readonly TimeSpan SearchCacheExpiration = TimeSpan.FromMinutes(10);

        public ReleaseNotesController(
            IReleaseNotesGeneratorService releaseNotesGeneratorService,
            IReleaseNotesRepository releaseNotesRepository,
            IMemoryCache cache,
            ILogger<ReleaseNotesController> logger)
        {
            _releaseNotesGeneratorService = releaseNotesGeneratorService;
            _releaseNotesRepository = releaseNotesRepository;
            _cache = cache;
            _logger = logger;
        }

        /// <summary>
        /// Gets release notes for the current deployed version
        /// </summary>
        [HttpGet("current")]
        [ResponseCache(Duration = 1800, VaryByQueryKeys = new[] { "environment" })] // 30 minutes
        public async Task<ActionResult<ReleaseNotes>> GetCurrentReleaseNotes([FromQuery] string environment = "dev")
        {
            try
            {
                var cacheKey = string.Format(CURRENT_RELEASE_CACHE_KEY, environment);
                
                if (_cache.TryGetValue(cacheKey, out ReleaseNotes? cachedReleaseNotes) && cachedReleaseNotes != null)
                {
                    _logger.LogDebug("Returning cached current release notes for environment {Environment}", environment);
                    return Ok(cachedReleaseNotes);
                }

                var releaseNotes = await _releaseNotesRepository.GetLatestByEnvironmentAsync(environment);
                
                if (releaseNotes == null)
                {
                    // Try to generate release notes for the latest tag
                    releaseNotes = await _releaseNotesGeneratorService.GenerateReleaseNotesForLatestTagAsync();
                    
                    if (releaseNotes == null)
                    {
                        return NotFound($"No release notes found for environment: {environment}");
                    }
                }

                // Cache the result
                _cache.Set(cacheKey, releaseNotes, CurrentReleaseCacheExpiration);
                _logger.LogDebug("Cached current release notes for environment {Environment}", environment);

                return Ok(releaseNotes);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to get current release notes for environment {Environment}", environment);
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Gets release notes for a specific version
        /// </summary>
        [HttpGet("{version}")]
        [ResponseCache(Duration = 86400, VaryByQueryKeys = new[] { "version" })] // 24 hours
        public async Task<ActionResult<ReleaseNotes>> GetReleaseNotesByVersion(string version)
        {
            try
            {
                var cacheKey = string.Format(VERSION_RELEASE_CACHE_KEY, version);
                
                if (_cache.TryGetValue(cacheKey, out ReleaseNotes? cachedReleaseNotes) && cachedReleaseNotes != null)
                {
                    _logger.LogDebug("Returning cached release notes for version {Version}", version);
                    return Ok(cachedReleaseNotes);
                }

                var releaseNotes = await _releaseNotesRepository.GetByVersionAsync(version);
                
                if (releaseNotes == null)
                {
                    return NotFound($"Release notes not found for version: {version}");
                }

                // Cache the result for 24 hours (version-specific data rarely changes)
                _cache.Set(cacheKey, releaseNotes, VersionReleaseCacheExpiration);
                _logger.LogDebug("Cached release notes for version {Version}", version);

                return Ok(releaseNotes);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to get release notes for version {Version}", version);
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Gets paginated release history
        /// </summary>
        [HttpGet("history")]
        [ResponseCache(Duration = 900, VaryByQueryKeys = new[] { "environment", "skip", "take" })] // 15 minutes
        public async Task<ActionResult<IEnumerable<ReleaseNotes>>> GetReleaseHistory(
            [FromQuery] string? environment = null,
            [FromQuery] int skip = 0,
            [FromQuery] int take = 10)
        {
            try
            {
                var cacheKey = string.Format(RELEASE_HISTORY_CACHE_KEY, environment ?? "all", skip, take);
                
                if (_cache.TryGetValue(cacheKey, out IEnumerable<ReleaseNotes>? cachedHistory) && cachedHistory != null)
                {
                    _logger.LogDebug("Returning cached release history for environment {Environment}, skip {Skip}, take {Take}", 
                        environment, skip, take);
                    return Ok(cachedHistory);
                }

                IEnumerable<ReleaseNotes> releaseNotes;

                if (!string.IsNullOrEmpty(environment))
                {
                    releaseNotes = await _releaseNotesRepository.GetByEnvironmentAsync(environment, skip, take);
                }
                else
                {
                    releaseNotes = await _releaseNotesRepository.GetAllAsync();
                    releaseNotes = releaseNotes.Skip(skip).Take(take);
                }

                // Cache the result
                _cache.Set(cacheKey, releaseNotes, HistoryCacheExpiration);
                _logger.LogDebug("Cached release history for environment {Environment}, skip {Skip}, take {Take}", 
                    environment, skip, take);

                return Ok(releaseNotes);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to get release history");
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Searches release notes by criteria
        /// </summary>
        [HttpGet("search")]
        [ResponseCache(Duration = 600, VaryByQueryKeys = new[] { "searchTerm", "environment", "fromDate", "toDate", "skip", "take" })] // 10 minutes
        public async Task<ActionResult<IEnumerable<ReleaseNotes>>> SearchReleaseNotes(
            [FromQuery] string? searchTerm = null,
            [FromQuery] string? environment = null,
            [FromQuery] DateTime? fromDate = null,
            [FromQuery] DateTime? toDate = null,
            [FromQuery] int skip = 0,
            [FromQuery] int take = 10)
        {
            try
            {
                var cacheKey = string.Format(SEARCH_CACHE_KEY, 
                    searchTerm ?? "null", 
                    environment ?? "null", 
                    fromDate?.ToString("yyyyMMdd") ?? "null", 
                    toDate?.ToString("yyyyMMdd") ?? "null", 
                    skip, 
                    take);
                
                if (_cache.TryGetValue(cacheKey, out IEnumerable<ReleaseNotes>? cachedResults) && cachedResults != null)
                {
                    _logger.LogDebug("Returning cached search results for term {SearchTerm}", searchTerm);
                    return Ok(cachedResults);
                }

                var releaseNotes = await _releaseNotesRepository.SearchAsync(
                    searchTerm, environment, fromDate, toDate, skip, take);

                // Cache the search results
                _cache.Set(cacheKey, releaseNotes, SearchCacheExpiration);
                _logger.LogDebug("Cached search results for term {SearchTerm}", searchTerm);

                return Ok(releaseNotes);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to search release notes");
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Generates release notes for a specific GitHub tag
        /// </summary>
        [HttpPost("generate/{tagName}")]
        public async Task<ActionResult<ReleaseNotes>> GenerateReleaseNotesForTag(string tagName, [FromQuery] string branch = "Kiro/dev")
        {
            try
            {
                var releaseNotes = await _releaseNotesGeneratorService.GenerateReleaseNotesForTagAsync(tagName, branch);
                
                // Clear relevant caches when new release notes are generated
                ClearReleaseNotesCache(releaseNotes?.Environment);
                
                return Ok(releaseNotes);
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Invalid tag format or tag not found: {TagName}", tagName);
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to generate release notes for tag {TagName}", tagName);
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Generates release notes for the latest tag
        /// </summary>
        [HttpPost("generate/latest")]
        public async Task<ActionResult<ReleaseNotes>> GenerateReleaseNotesForLatestTag([FromQuery] string branch = "Kiro/dev")
        {
            try
            {
                var releaseNotes = await _releaseNotesGeneratorService.GenerateReleaseNotesForLatestTagAsync(branch);
                
                if (releaseNotes == null)
                {
                    return NotFound($"No tags found on branch: {branch}");
                }

                // Clear relevant caches when new release notes are generated
                ClearReleaseNotesCache(releaseNotes.Environment);

                return Ok(releaseNotes);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to generate release notes for latest tag on branch {Branch}", branch);
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Clears the release notes cache for a specific environment or all environments
        /// </summary>
        [HttpPost("cache/clear")]
        public ActionResult ClearCache([FromQuery] string? environment = null)
        {
            try
            {
                ClearReleaseNotesCache(environment);
                _logger.LogInformation("Cache cleared for environment: {Environment}", environment ?? "all");
                return Ok(new { message = $"Cache cleared for environment: {environment ?? "all"}" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to clear cache");
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Private method to clear release notes cache
        /// </summary>
        private void ClearReleaseNotesCache(string? environment = null)
        {
            try
            {
                // Clear current release cache
                if (!string.IsNullOrEmpty(environment))
                {
                    var currentCacheKey = string.Format(CURRENT_RELEASE_CACHE_KEY, environment);
                    _cache.Remove(currentCacheKey);
                }
                else
                {
                    // Clear cache for common environments
                    var environments = new[] { "dev", "staging", "production" };
                    foreach (var env in environments)
                    {
                        var currentCacheKey = string.Format(CURRENT_RELEASE_CACHE_KEY, env);
                        _cache.Remove(currentCacheKey);
                    }
                }

                // Clear history and search caches (these are harder to target specifically, so we clear common patterns)
                // In a production system, you might want to implement a more sophisticated cache tagging system
                _logger.LogDebug("Cleared release notes cache for environment: {Environment}", environment ?? "all");
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to clear some cache entries");
            }
        }
    }
}
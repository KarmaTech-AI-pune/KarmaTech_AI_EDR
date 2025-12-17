using Microsoft.AspNetCore.Mvc;
using System.Reflection;
using System.Text.Json;
using System.Runtime.InteropServices;
using System.Diagnostics;

namespace NJSAPI.Controllers
{
    /// <summary>
    /// Version information API controller
    /// Provides application version, build information, and health status
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    [Produces("application/json")]
    public class VersionController : ControllerBase
    {
        private readonly ILogger<VersionController> _logger;
        private readonly IConfiguration _configuration;

        public VersionController(ILogger<VersionController> logger, IConfiguration configuration)
        {
            _logger = logger;
            _configuration = configuration;
        }

        /// <summary>
        /// Get current application version information
        /// </summary>
        /// <returns>Version information including version number, build date, and commit hash</returns>
        [HttpGet]
        public IActionResult GetVersion()
        {
            try
            {
                var versionInfo = GetVersionInfo();
                
                _logger.LogInformation("Version information requested: {Version}", versionInfo.Version);
                
                return Ok(new
                {
                    success = true,
                    data = versionInfo,
                    timestamp = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving version information");
                return StatusCode(500, new
                {
                    success = false,
                    message = "Error retrieving version information",
                    timestamp = DateTime.UtcNow
                });
            }
        }

        /// <summary>
        /// Get detailed version information including system details
        /// </summary>
        /// <returns>Detailed version and system information</returns>
        [HttpGet("detailed")]
        public IActionResult GetDetailedVersion()
        {
            try
            {
                var versionInfo = GetVersionInfo();
                var systemInfo = GetSystemInfo();
                
                var detailedInfo = new
                {
                    version = versionInfo,
                    system = systemInfo,
                    environment = new
                    {
                        machineName = Environment.MachineName,
                        osVersion = Environment.OSVersion.ToString(),
                        processorCount = Environment.ProcessorCount,
                        workingSet = Environment.WorkingSet,
                        dotNetVersion = Environment.Version.ToString()
                    }
                };

                _logger.LogInformation("Detailed version information requested");
                
                return Ok(new
                {
                    success = true,
                    data = detailedInfo,
                    timestamp = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving detailed version information");
                return StatusCode(500, new
                {
                    success = false,
                    message = "Error retrieving detailed version information",
                    timestamp = DateTime.UtcNow
                });
            }
        }

        /// <summary>
        /// Health check endpoint with version information
        /// </summary>
        /// <returns>Health status with version context</returns>
        [HttpGet("health")]
        public IActionResult GetHealth()
        {
            try
            {
                var versionInfo = GetVersionInfo();
                var uptime = GetUptime();
                var environment = _configuration["ASPNETCORE_ENVIRONMENT"] ?? "unknown";
                
                // Log health check with version context
                using var scope = _logger.BeginScope(new Dictionary<string, object>
                {
                    ["Version"] = versionInfo.Version,
                    ["CommitHash"] = versionInfo.CommitHash,
                    ["Environment"] = environment,
                    ["EventType"] = "HealthCheck"
                });

                _logger.LogInformation(
                    "🏥 HEALTH CHECK - Version: {Version}, Environment: {Environment}, Uptime: {Uptime}",
                    versionInfo.Version, environment, uptime);
                
                var healthStatus = new
                {
                    status = "healthy",
                    version = versionInfo.Version,
                    commitHash = versionInfo.CommitHash,
                    buildDate = versionInfo.BuildDate,
                    environment = environment,
                    uptime = uptime,
                    timestamp = DateTime.UtcNow,
                    checks = new
                    {
                        api = "healthy",
                        memory = GetMemoryStatus(),
                        disk = GetDiskStatus(),
                        version_file = CheckVersionFile()
                    }
                };

                return Ok(healthStatus);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, 
                    "❌ HEALTH CHECK FAILED - Error: {ErrorMessage}", 
                    ex.Message);
                    
                return StatusCode(503, new
                {
                    status = "unhealthy",
                    error = ex.Message,
                    version = GetVersionInfo().Version,
                    timestamp = DateTime.UtcNow
                });
            }
        }

        /// <summary>
        /// Get version history from version-history.json file
        /// </summary>
        /// <param name="limit">Maximum number of versions to return (default: 10)</param>
        /// <returns>List of recent versions with release notes</returns>
        [HttpGet("history")]
        public IActionResult GetVersionHistory([FromQuery] int limit = 10)
        {
            try
            {
                var versionHistory = GetVersionHistoryFromFile(limit);
                
                if (versionHistory == null || !versionHistory.Any())
                {
                    // Fallback to current version if no history file exists
                    var currentVersion = GetVersionInfo();
                    var fallbackHistory = new[]
                    {
                        new
                        {
                            version = currentVersion.Version,
                            tag = $"v{currentVersion.Version}",
                            releaseDate = currentVersion.BuildDate,
                            commitHash = currentVersion.CommitHash,
                            author = "System",
                            isCurrent = true,
                            releaseNotes = new
                            {
                                features = new object[0],
                                bugFixes = new object[0],
                                breakingChanges = new object[0],
                                other = new object[0],
                                totalCommits = 0
                            }
                        }
                    };

                    return Ok(new
                    {
                        success = true,
                        data = fallbackHistory,
                        totalVersions = 1,
                        timestamp = DateTime.UtcNow
                    });
                }

                return Ok(new
                {
                    success = true,
                    data = versionHistory,
                    totalVersions = versionHistory.Count(),
                    timestamp = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving version history");
                return StatusCode(500, new
                {
                    success = false,
                    message = "Error retrieving version history",
                    timestamp = DateTime.UtcNow
                });
            }
        }

        /// <summary>
        /// Get release notes for a specific version
        /// </summary>
        /// <param name="version">Version number (e.g., "1.2.0")</param>
        /// <returns>Detailed release notes for the specified version</returns>
        [HttpGet("release-notes/{version}")]
        public IActionResult GetReleaseNotes(string version)
        {
            try
            {
                var versionHistory = GetVersionHistoryFromFile();
                var versionInfo = versionHistory?.FirstOrDefault(v => 
                    v.GetProperty("version").GetString() == version);

                if (versionInfo == null)
                {
                    return NotFound(new
                    {
                        success = false,
                        message = $"Version {version} not found",
                        timestamp = DateTime.UtcNow
                    });
                }

                return Ok(new
                {
                    success = true,
                    data = versionInfo,
                    timestamp = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving release notes for version {Version}", version);
                return StatusCode(500, new
                {
                    success = false,
                    message = "Error retrieving release notes",
                    timestamp = DateTime.UtcNow
                });
            }
        }

        /// <summary>
        /// Get latest release notes
        /// </summary>
        /// <returns>Release notes for the current/latest version</returns>
        [HttpGet("release-notes/latest")]
        public IActionResult GetLatestReleaseNotes()
        {
            try
            {
                var versionHistory = GetVersionHistoryFromFile(1);
                var latestVersion = versionHistory?.FirstOrDefault();

                if (latestVersion == null)
                {
                    var currentVersion = GetVersionInfo();
                    return Ok(new
                    {
                        success = true,
                        data = new
                        {
                            version = currentVersion.Version,
                            tag = $"v{currentVersion.Version}",
                            releaseDate = currentVersion.BuildDate,
                            commitHash = currentVersion.CommitHash,
                            releaseNotes = new
                            {
                                features = new object[0],
                                bugFixes = new object[0],
                                breakingChanges = new object[0],
                                other = new object[0],
                                totalCommits = 0
                            }
                        },
                        timestamp = DateTime.UtcNow
                    });
                }

                return Ok(new
                {
                    success = true,
                    data = latestVersion,
                    timestamp = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving latest release notes");
                return StatusCode(500, new
                {
                    success = false,
                    message = "Error retrieving latest release notes",
                    timestamp = DateTime.UtcNow
                });
            }
        }

        /// <summary>
        /// Log deployment event (for use by deployment scripts)
        /// </summary>
        /// <param name="request">Deployment event details</param>
        /// <returns>Success confirmation</returns>
        [HttpPost("deployment")]
        public IActionResult LogDeploymentEvent([FromBody] DeploymentEventRequest request)
        {
            try
            {
                var currentVersion = GetVersionInfo();
                var environment = _configuration["ASPNETCORE_ENVIRONMENT"] ?? "unknown";

                using var scope = _logger.BeginScope(new Dictionary<string, object>
                {
                    ["DeploymentVersion"] = request.Version ?? currentVersion.Version,
                    ["Environment"] = request.Environment ?? environment,
                    ["EventType"] = request.EventType,
                    ["CommitHash"] = request.CommitHash ?? currentVersion.CommitHash
                });

                switch (request.EventType?.ToLowerInvariant())
                {
                    case "start":
                        _logger.LogInformation(
                            "🚀 DEPLOYMENT STARTED - Version: {Version}, Environment: {Environment}, Commit: {CommitHash}",
                            request.Version, request.Environment, request.CommitHash);
                        break;
                    case "success":
                        _logger.LogInformation(
                            "✅ DEPLOYMENT SUCCESSFUL - Version: {Version}, Environment: {Environment}, Duration: {Duration}s",
                            request.Version, request.Environment, request.Duration ?? 0);
                        break;
                    case "failure":
                        _logger.LogError(
                            "❌ DEPLOYMENT FAILED - Version: {Version}, Environment: {Environment}, Error: {Error}",
                            request.Version, request.Environment, request.Error ?? "Unknown error");
                        break;
                    default:
                        _logger.LogInformation(
                            "📝 DEPLOYMENT EVENT - Type: {EventType}, Version: {Version}, Environment: {Environment}",
                            request.EventType, request.Version, request.Environment);
                        break;
                }

                return Ok(new
                {
                    success = true,
                    message = "Deployment event logged successfully",
                    version = currentVersion.Version,
                    timestamp = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error logging deployment event");
                return StatusCode(500, new
                {
                    success = false,
                    message = "Error logging deployment event",
                    timestamp = DateTime.UtcNow
                });
            }
        }

        private VersionInfo GetVersionInfo()
        {
            var assembly = Assembly.GetExecutingAssembly();
            var version = assembly.GetName().Version?.ToString() ?? "1.0.0.0";
            
            // Try to read version from VERSION file in repository root
            var versionFromFile = ReadVersionFromFile();
            if (!string.IsNullOrEmpty(versionFromFile))
            {
                version = versionFromFile;
            }

            // Get build date from assembly
            var buildDate = GetBuildDate(assembly);
            
            // Get commit hash from configuration or environment
            var commitHash = _configuration["Build:CommitHash"] ?? 
                           Environment.GetEnvironmentVariable("BUILD_COMMIT_HASH") ?? 
                           "unknown";

            return new VersionInfo
            {
                Version = version,
                BuildDate = buildDate,
                CommitHash = commitHash,
                AssemblyVersion = assembly.GetName().Version?.ToString() ?? "unknown",
                FileVersion = assembly.GetCustomAttribute<AssemblyFileVersionAttribute>()?.Version ?? "unknown",
                ProductVersion = assembly.GetCustomAttribute<AssemblyInformationalVersionAttribute>()?.InformationalVersion ?? "unknown"
            };
        }

        private string? ReadVersionFromFile()
        {
            try
            {
                // Look for VERSION file in various locations
                var possiblePaths = new[]
                {
                    Path.Combine(Directory.GetCurrentDirectory(), "VERSION"),
                    Path.Combine(Directory.GetCurrentDirectory(), "..", "..", "..", "VERSION"),
                    Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "VERSION")
                };

                foreach (var path in possiblePaths)
                {
                    if (System.IO.File.Exists(path))
                    {
                        var content = System.IO.File.ReadAllText(path).Trim();
                        if (!string.IsNullOrEmpty(content))
                        {
                            _logger.LogDebug("Version read from file: {Path} -> {Version}", path, content);
                            return content;
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Could not read version from file");
            }

            return null;
        }

        private DateTime GetBuildDate(Assembly assembly)
        {
            try
            {
                // Try to get build date from configuration
                var buildDateString = _configuration["Build:Date"] ?? 
                                    Environment.GetEnvironmentVariable("BUILD_DATE");
                
                if (DateTime.TryParse(buildDateString, out var configDate))
                {
                    return configDate;
                }

                // Fallback to assembly creation time (approximate)
                var location = assembly.Location;
                if (!string.IsNullOrEmpty(location) && System.IO.File.Exists(location))
                {
                    return System.IO.File.GetCreationTimeUtc(location);
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Could not determine build date");
            }

            // Final fallback
            return DateTime.UtcNow;
        }

        private object GetSystemInfo()
        {
            return new
            {
                applicationName = "KarmaTech AI EDR",
                framework = ".NET 8.0",
                runtime = RuntimeInformation.FrameworkDescription,
                architecture = RuntimeInformation.ProcessArchitecture.ToString(),
                osDescription = RuntimeInformation.OSDescription
            };
        }

        private string GetUptime()
        {
            var uptime = DateTime.UtcNow - Process.GetCurrentProcess().StartTime.ToUniversalTime();
            return $"{uptime.Days}d {uptime.Hours}h {uptime.Minutes}m {uptime.Seconds}s";
        }

        private string GetMemoryStatus()
        {
            try
            {
                var workingSet = Environment.WorkingSet;
                var workingSetMB = workingSet / (1024 * 1024);
                return workingSetMB < 1000 ? "healthy" : "warning"; // Warning if over 1GB
            }
            catch
            {
                return "unknown";
            }
        }

        private string GetDiskStatus()
        {
            try
            {
                var currentDirectory = Directory.GetCurrentDirectory();
                var drive = new DriveInfo(Path.GetPathRoot(currentDirectory) ?? "C:");
                var freeSpaceGB = drive.AvailableFreeSpace / (1024 * 1024 * 1024);
                return freeSpaceGB > 1 ? "healthy" : "warning"; // Warning if less than 1GB free
            }
            catch
            {
                return "unknown";
            }
        }

        private string CheckVersionFile()
        {
            try
            {
                var versionFromFile = ReadVersionFromFile();
                return !string.IsNullOrEmpty(versionFromFile) ? "healthy" : "missing";
            }
            catch
            {
                return "error";
            }
        }

        private IEnumerable<JsonElement>? GetVersionHistoryFromFile(int limit = 50)
        {
            try
            {
                // Look for version-history.json file in various locations
                var possiblePaths = new[]
                {
                    Path.Combine(Directory.GetCurrentDirectory(), "version-history.json"),
                    Path.Combine(Directory.GetCurrentDirectory(), "..", "..", "..", "version-history.json"),
                    Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "version-history.json")
                };

                foreach (var path in possiblePaths)
                {
                    if (System.IO.File.Exists(path))
                    {
                        var content = System.IO.File.ReadAllText(path);
                        var historyData = JsonSerializer.Deserialize<JsonElement>(content);
                        
                        if (historyData.TryGetProperty("versions", out var versionsElement) && 
                            versionsElement.ValueKind == JsonValueKind.Array)
                        {
                            var versions = versionsElement.EnumerateArray().Take(limit);
                            _logger.LogDebug("Version history read from file: {Path} -> {Count} versions", path, versions.Count());
                            return versions;
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Could not read version history from file");
            }

            return null;
        }
    }

    /// <summary>
    /// Version information model
    /// </summary>
    public class VersionInfo
    {
        public string Version { get; set; } = string.Empty;
        public DateTime BuildDate { get; set; }
        public string CommitHash { get; set; } = string.Empty;
        public string AssemblyVersion { get; set; } = string.Empty;
        public string FileVersion { get; set; } = string.Empty;
        public string ProductVersion { get; set; } = string.Empty;
    }

    /// <summary>
    /// Deployment event request model
    /// </summary>
    public class DeploymentEventRequest
    {
        public string? EventType { get; set; } // start, success, failure
        public string? Version { get; set; }
        public string? Environment { get; set; }
        public string? CommitHash { get; set; }
        public double? Duration { get; set; } // in seconds
        public string? Error { get; set; }
    }
}
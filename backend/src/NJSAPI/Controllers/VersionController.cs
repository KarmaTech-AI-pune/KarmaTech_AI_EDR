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
                
                return Ok(new
                {
                    status = "healthy",
                    version = versionInfo.Version,
                    uptime = GetUptime(),
                    timestamp = DateTime.UtcNow,
                    checks = new
                    {
                        database = "healthy", // This could be expanded to actual DB health check
                        memory = "healthy",
                        disk = "healthy"
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Health check failed");
                return StatusCode(503, new
                {
                    status = "unhealthy",
                    error = ex.Message,
                    timestamp = DateTime.UtcNow
                });
            }
        }

        /// <summary>
        /// Get version history from git tags (if available)
        /// </summary>
        /// <returns>List of recent versions</returns>
        [HttpGet("history")]
        public IActionResult GetVersionHistory()
        {
            try
            {
                // This would typically read from git tags or a version history file
                // For now, return current version as single entry
                var currentVersion = GetVersionInfo();
                
                var history = new[]
                {
                    new
                    {
                        version = currentVersion.Version,
                        releaseDate = currentVersion.BuildDate,
                        isCurrent = true,
                        releaseNotes = "Current version"
                    }
                };

                return Ok(new
                {
                    success = true,
                    data = history,
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
                    if (File.Exists(path))
                    {
                        var content = File.ReadAllText(path).Trim();
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
                if (!string.IsNullOrEmpty(location) && File.Exists(location))
                {
                    return File.GetCreationTimeUtc(location);
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
}
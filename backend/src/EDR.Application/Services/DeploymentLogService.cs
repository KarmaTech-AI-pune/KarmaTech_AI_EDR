using Microsoft.Extensions.Logging;
using EDR.Application.Services.IContract;
using System.Reflection;

namespace EDR.Application.Services{
    /// <summary>
    /// Service for logging deployment-related events with version context
    /// </summary>
    public class DeploymentLogService : IDeploymentLogService
    {
        private readonly ILogger<DeploymentLogService> _logger;
        private readonly string _currentVersion;

        public DeploymentLogService(ILogger<DeploymentLogService> logger)
        {
            _logger = logger;
            _currentVersion = GetCurrentVersion();
        }

        public void LogDeploymentStart(string version, string environment, string? commitHash = null)
        {
            using var scope = _logger.BeginScope(new Dictionary<string, object>
            {
                ["DeploymentVersion"] = version,
                ["Environment"] = environment,
                ["CommitHash"] = commitHash ?? "unknown",
                ["EventType"] = "DeploymentStart"
            });

            _logger.LogInformation(
                "ðŸš€ DEPLOYMENT STARTED - Version: {Version}, Environment: {Environment}, Commit: {CommitHash}",                version, environment, commitHash ?? "unknown");
        }

        public void LogDeploymentSuccess(string version, string environment, TimeSpan duration)
        {
            using var scope = _logger.BeginScope(new Dictionary<string, object>
            {
                ["DeploymentVersion"] = version,
                ["Environment"] = environment,
                ["Duration"] = duration.TotalSeconds,
                ["EventType"] = "DeploymentSuccess"
            });

            _logger.LogInformation(
                "âœ… DEPLOYMENT SUCCESSFUL - Version: {Version}, Environment: {Environment}, Duration: {Duration:F2}s",                version, environment, duration.TotalSeconds);
        }

        public void LogDeploymentFailure(string version, string environment, Exception error, TimeSpan duration)
        {
            using var scope = _logger.BeginScope(new Dictionary<string, object>
            {
                ["DeploymentVersion"] = version,
                ["Environment"] = environment,
                ["Duration"] = duration.TotalSeconds,
                ["EventType"] = "DeploymentFailure",
                ["ErrorType"] = error.GetType().Name
            });

            _logger.LogError(error,
                "âŒ DEPLOYMENT FAILED - Version: {Version}, Environment: {Environment}, Duration: {Duration:F2}s, Error: {ErrorMessage}",                version, environment, duration.TotalSeconds, error.Message);
        }

        public void LogDatabaseMigration(string version, string migrationName, bool success)
        {
            using var scope = _logger.BeginScope(new Dictionary<string, object>
            {
                ["DeploymentVersion"] = version,
                ["MigrationName"] = migrationName,
                ["EventType"] = "DatabaseMigration",
                ["Success"] = success
            });

            if (success)
            {
                _logger.LogInformation(
                    "ðŸ—„ï¸ DATABASE MIGRATION SUCCESSFUL - Version: {Version}, Migration: {MigrationName}",                    version, migrationName);
            }
            else
            {
                _logger.LogError(
                    "ðŸ—„ï¸ DATABASE MIGRATION FAILED - Version: {Version}, Migration: {MigrationName}",                    version, migrationName);
            }
        }

        public void LogHealthCheck(string version, string status, Dictionary<string, object>? details = null)
        {
            using var scope = _logger.BeginScope(new Dictionary<string, object>
            {
                ["Version"] = version,
                ["HealthStatus"] = status,
                ["EventType"] = "HealthCheck"
            });

            var logLevel = status.ToLowerInvariant() == "healthy" ? LogLevel.Information : LogLevel.Warning;
            
            _logger.Log(logLevel,
                "ðŸ¥ HEALTH CHECK - Version: {Version}, Status: {Status}, Details: {Details}",                version, status, details != null ? string.Join(", ", details.Select(kvp => $"{kvp.Key}={kvp.Value}")) : "none");
        }

        public void LogVersionMismatch(string expectedVersion, string actualVersion, string location)
        {
            using var scope = _logger.BeginScope(new Dictionary<string, object>
            {
                ["ExpectedVersion"] = expectedVersion,
                ["ActualVersion"] = actualVersion,
                ["Location"] = location,
                ["EventType"] = "VersionMismatch"
            });

            _logger.LogWarning(
                "âš ï¸ VERSION MISMATCH DETECTED - Expected: {ExpectedVersion}, Actual: {ActualVersion}, Location: {Location}",                expectedVersion, actualVersion, location);
        }

        /// <summary>
        /// Gets the current application version
        /// </summary>
        private static string GetCurrentVersion()
        {
            try
            {
                // Try to read from VERSION file first
                var versionFromFile = ReadVersionFromFile();
                if (!string.IsNullOrEmpty(versionFromFile))
                {
                    return versionFromFile;
                }

                // Fallback to assembly version
                var assembly = Assembly.GetExecutingAssembly();
                return assembly.GetName().Version?.ToString() ?? "unknown";
            }
            catch
            {
                return "unknown";
            }
        }

        /// <summary>
        /// Reads version from VERSION file in repository root
        /// </summary>
        private static string? ReadVersionFromFile()
        {
            try
            {
                var possiblePaths = new[]
                {
                    Path.Combine(Directory.GetCurrentDirectory(), "VERSION"),
                    Path.Combine(Directory.GetCurrentDirectory(), "..", "..", "..", "VERSION"),
                    Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "VERSION"),
                    Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "..", "..", "..", "VERSION")
                };

                foreach (var path in possiblePaths)
                {
                    if (File.Exists(path))
                    {
                        var content = File.ReadAllText(path).Trim();
                        if (!string.IsNullOrEmpty(content))
                        {
                            return content;
                        }
                    }
                }
            }
            catch
            {
                // Ignore errors when reading version file
            }

            return null;
        }
    }
}

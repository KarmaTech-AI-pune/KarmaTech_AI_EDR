namespace EDR.Application.Services.IContract{
    /// <summary>
    /// Service for logging deployment-related events with version context
    /// </summary>
    public interface IDeploymentLogService
    {
        /// <summary>
        /// Logs deployment start event with version information
        /// </summary>
        /// <param name="version">Version being deployed</param>
        /// <param name="environment">Target environment</param>
        /// <param name="commitHash">Git commit hash</param>
        void LogDeploymentStart(string version, string environment, string? commitHash = null);

        /// <summary>
        /// Logs deployment success event
        /// </summary>
        /// <param name="version">Version that was deployed</param>
        /// <param name="environment">Target environment</param>
        /// <param name="duration">Deployment duration</param>
        void LogDeploymentSuccess(string version, string environment, TimeSpan duration);

        /// <summary>
        /// Logs deployment failure event
        /// </summary>
        /// <param name="version">Version that failed to deploy</param>
        /// <param name="environment">Target environment</param>
        /// <param name="error">Error that occurred</param>
        /// <param name="duration">Time before failure</param>
        void LogDeploymentFailure(string version, string environment, Exception error, TimeSpan duration);

        /// <summary>
        /// Logs database migration event
        /// </summary>
        /// <param name="version">Version being migrated to</param>
        /// <param name="migrationName">Name of the migration</param>
        /// <param name="success">Whether migration succeeded</param>
        void LogDatabaseMigration(string version, string migrationName, bool success);

        /// <summary>
        /// Logs application health check with version context
        /// </summary>
        /// <param name="version">Current application version</param>
        /// <param name="status">Health status</param>
        /// <param name="details">Additional health details</param>
        void LogHealthCheck(string version, string status, Dictionary<string, object>? details = null);

        /// <summary>
        /// Logs version mismatch detection
        /// </summary>
        /// <param name="expectedVersion">Expected version</param>
        /// <param name="actualVersion">Actual version found</param>
        /// <param name="location">Where the mismatch was found</param>
        void LogVersionMismatch(string expectedVersion, string actualVersion, string location);
    }
}

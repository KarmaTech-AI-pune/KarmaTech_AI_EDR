using System.Reflection;

namespace EDR.API.Middleware{
    /// <summary>
    /// Middleware to add version context to all requests and error responses
    /// </summary>
    public class VersionContextMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<VersionContextMiddleware> _logger;
        private readonly string _version;
        private readonly string _commitHash;

        public VersionContextMiddleware(RequestDelegate next, ILogger<VersionContextMiddleware> logger, IConfiguration configuration)
        {
            _next = next;
            _logger = logger;
            
            // Get version information once at startup
            var assembly = Assembly.GetExecutingAssembly();
            _version = GetVersionFromFile() ?? assembly.GetName().Version?.ToString() ?? "unknown";
            _commitHash = configuration["Build:CommitHash"] ?? 
                         Environment.GetEnvironmentVariable("BUILD_COMMIT_HASH") ?? 
                         "unknown";
        }

        public async Task InvokeAsync(HttpContext context)
        {
            // Add version headers to all responses
            context.Response.Headers["X-API-Version"] = _version;
            context.Response.Headers["X-Commit-Hash"] = _commitHash;

            // Create a scope with version context for logging
            using var scope = _logger.BeginScope(new Dictionary<string, object>
            {
                ["Version"] = _version,
                ["CommitHash"] = _commitHash,
                ["RequestId"] = context.TraceIdentifier
            });

            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                // Log error with version context
                _logger.LogError(ex, 
                    "Unhandled exception occurred. Version: {Version}, CommitHash: {CommitHash}, RequestId: {RequestId}, Path: {Path}",
                    _version, _commitHash, context.TraceIdentifier, context.Request.Path);

                // Add version context to error response
                if (!context.Response.HasStarted)
                {
                    context.Response.StatusCode = 500;
                    context.Response.ContentType = "application/json";

                    var errorResponse = new
                    {
                        error = "Internal Server Error",
                        message = "An unexpected error occurred",
                        requestId = context.TraceIdentifier,
                        version = _version,
                        timestamp = DateTime.UtcNow
                    };

                    await context.Response.WriteAsync(System.Text.Json.JsonSerializer.Serialize(errorResponse));
                }

                throw; // Re-throw to maintain exception handling chain
            }
        }

        /// <summary>
        /// Reads version from VERSION file in repository root
        /// </summary>
        private static string? GetVersionFromFile()
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
                    if (System.IO.File.Exists(path))
                    {
                        var content = System.IO.File.ReadAllText(path).Trim();
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

    /// <summary>
    /// Extension method to register the version context middleware
    /// </summary>
    public static class VersionContextMiddlewareExtensions
    {
        public static IApplicationBuilder UseVersionContext(this IApplicationBuilder builder)
        {
            return builder.UseMiddleware<VersionContextMiddleware>();
        }
    }
}

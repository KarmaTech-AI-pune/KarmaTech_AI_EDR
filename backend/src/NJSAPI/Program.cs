using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Reflection;
using NJS.Domain.Extensions;
using NJS.Application.Extensions;
using NJSAPI.Extensions;
using NLog.Web;
using Microsoft.Extensions.Options;
using NJSAPI.Configurations;
using NJSAPI.Middleware;
using NJS.Domain.Services;
using NJS.Application.Services;
using NJS.Application.Services.IContract;
using NJS.Domain.Database;
using Microsoft.EntityFrameworkCore;

internal class Program
{
    private static async Task Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);


        builder.Services.AddControllers();
        builder.Services.AddLogging();

        // Add HttpContextAccessor as singleton
        builder.Services.AddSingleton<IHttpContextAccessor, HttpContextAccessor>();

        // Add tenant resolution strategies in priority order

        builder.Services.AddSingleton<ITenantResolutionStrategy, ClaimsResolutionStrategy>();
        builder.Services.AddSingleton<ITenantResolutionStrategy, HeaderResolutionStrategy>();
        builder.Services.AddSingleton<ITenantResolutionStrategy, DomainResolutionStrategy>();

        // Add tenant services for tr
        builder.Services.AddScoped<ITenantConnectionResolver, TenantConnectionResolver>();
        //  builder.Services.AddScoped<ITenantDatabaseService, TenantDatabaseService>();

        var environment = builder.Configuration.GetValue<string>("DNS:Env");
        if (environment is "Development" or "Dev")
        {
            builder.Services.AddScoped<IDNSManagementService, MockDNSManagementService>();
        }
        else
        {
            builder.Services.AddScoped<IDNSManagementService, DNSManagementService>();

            // Note: For production, you'll need to configure AWS credentials and region
            // services.AddAWSService<IAmazonRoute53>();
        }
        builder.Services.AddDatabaseServices(builder.Configuration);
        builder.Services.AddApplicationServices();
        builder.Services.AddTenantServices(builder.Configuration);

        builder.Services.AddEndpointsApiExplorer();
        builder.Services.AddConfiguredSwagger(builder.Configuration);

        // Configure CORS for tenant
        builder.Services.AddCors(options =>
        {
            var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>();

            var allOrigins = allowedOrigins?.ToList();

            options.AddPolicy("AllowSpecificOrigin",
                builder => builder
                    .SetIsOriginAllowedToAllowWildcardSubdomains()
                    .WithOrigins(allOrigins.ToArray())
                    .AllowAnyHeader()
                    .AllowAnyMethod()
                    .AllowCredentials());
        });

        builder.Services.AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
        })
        .AddJwtBearer(options =>
        {
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                ValidIssuer = builder.Configuration["Jwt:Issuer"],
                ValidAudience = builder.Configuration["Jwt:Audience"],
                IssuerSigningKey = new SymmetricSecurityKey(
                    Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]))
            };
        });

        // Configure Authorization Policies
        // builder.Services.AddAuthorization(options =>
        // {
        //     options.AddPolicy("RequireAdminRole", policy =>
        //         policy.RequireRole("Admin"));
        //
        //     options.AddPolicy("RequireManagerRole", policy =>
        //         policy.RequireRole("Manager"));
        //
        //     options.AddPolicy("RequireUserRole", policy =>
        //         policy.RequireRole("User"));
        //
        //     options.AddPolicy("RequireAdminOrManager", policy =>
        //         policy.RequireRole("Admin", "Manager"));
        //
        //     options.DefaultPolicy = new AuthorizationPolicyBuilder()
        //         .RequireAuthenticatedUser()
        //         .Build();
        // });

        builder.Services.AddCompression();
        builder.Host.UseNLog();
        builder.Services.AddAuditServices();
        builder.Services.ConfigureAuditObservers();

        // Configure the app
        var app = builder.Build();

        // Log version information at startup
        LogVersionInformation(app);
        
        // Log deployment start event
        LogDeploymentStart(app);

        // Use CORS before other middleware
        app.UseCors("AllowSpecificOrigin");


        app.UseSwagger();
        app.UseSwaggerUI(options =>
        {
            var swaggerSettings = app.Services.GetRequiredService<IOptions<SwaggerSettings>>().Value;
            options.SwaggerEndpoint($"/swagger/{swaggerSettings.Version}/swagger.json", $"{swaggerSettings.Title}");
        });

        app.UseResponseCompression();
        app.UseHttpsRedirection();

        // Add version context to all requests and responses
        app.UseVersionContext();
        
        app.UseMiddleware<TenantResolverMiddleware>();
        app.UseAuthentication();
        app.UseAuthorization();
        app.UseMiddleware<TenantMiddleware>();
        using (var scope = app.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<ProjectManagementContext>();

            // ✅ 1. Apply all pending migrations before seeding
            db.Database.Migrate();

            // ✅ 2. Then seed your data
            await SeedExtensions.InitializeDatabaseAsync(app);
        }

        // ✅ Map controllers and run the app
        app.MapControllers();
        app.MapFallbackToFile("index.html");
        app.Run();

        app.MapControllers();

        // This will redirect all unhandled routes (that are not static files or API routes) to index.html
        // This should be placed after UseStaticFiles, UseRouting, UseAuthentication, UseAuthorization, and MapControllers
        app.MapFallbackToFile("index.html");

        app.Run();
    }

    /// <summary>
    /// Logs version information at application startup
    /// </summary>
    private static void LogVersionInformation(WebApplication app)
    {
        try
        {
            var logger = app.Services.GetRequiredService<ILogger<Program>>();
            var configuration = app.Services.GetRequiredService<IConfiguration>();
            
            // Get version information
            var assembly = System.Reflection.Assembly.GetExecutingAssembly();
            var version = assembly.GetName().Version?.ToString() ?? "unknown";
            var informationalVersion = assembly.GetCustomAttribute<System.Reflection.AssemblyInformationalVersionAttribute>()?.InformationalVersion ?? version;
            
            // Try to read version from VERSION file
            var versionFromFile = ReadVersionFromFile();
            if (!string.IsNullOrEmpty(versionFromFile))
            {
                version = versionFromFile;
                informationalVersion = versionFromFile;
            }

            // Get build information
            var buildDate = GetBuildDate(configuration);
            var commitHash = configuration["Build:CommitHash"] ?? 
                           Environment.GetEnvironmentVariable("BUILD_COMMIT_HASH") ?? 
                           "unknown";
            var environment = configuration["ASPNETCORE_ENVIRONMENT"] ?? "unknown";

            // Log startup information with version context
            logger.LogInformation("=== KarmaTech AI EDR API Starting ===");
            logger.LogInformation("Version: {Version}", informationalVersion);
            logger.LogInformation("Assembly Version: {AssemblyVersion}", version);
            logger.LogInformation("Build Date: {BuildDate}", buildDate);
            logger.LogInformation("Commit Hash: {CommitHash}", commitHash);
            logger.LogInformation("Environment: {Environment}", environment);
            logger.LogInformation("Framework: {Framework}", System.Runtime.InteropServices.RuntimeInformation.FrameworkDescription);
            logger.LogInformation("OS: {OS}", System.Runtime.InteropServices.RuntimeInformation.OSDescription);
            logger.LogInformation("Machine: {Machine}", Environment.MachineName);
            logger.LogInformation("=== Startup Complete ===");
        }
        catch (Exception ex)
        {
            // Use console as fallback if logging isn't available yet
            Console.WriteLine($"Error logging version information: {ex.Message}");
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

    /// <summary>
    /// Gets build date from configuration or file system
    /// </summary>
    private static DateTime GetBuildDate(IConfiguration configuration)
    {
        try
        {
            // Try to get build date from configuration
            var buildDateString = configuration["Build:Date"] ?? 
                                Environment.GetEnvironmentVariable("BUILD_DATE");
            
            if (DateTime.TryParse(buildDateString, out var configDate))
            {
                return configDate;
            }

            // Fallback to assembly creation time
            var assembly = System.Reflection.Assembly.GetExecutingAssembly();
            var location = assembly.Location;
            if (!string.IsNullOrEmpty(location) && System.IO.File.Exists(location))
            {
                return System.IO.File.GetCreationTimeUtc(location);
            }
        }
        catch
        {
            // Ignore errors
        }

        return DateTime.UtcNow;
    }

    /// <summary>
    /// Logs deployment start event
    /// </summary>
    private static void LogDeploymentStart(WebApplication app)
    {
        try
        {
            var logger = app.Services.GetRequiredService<ILogger<Program>>();
            var configuration = app.Services.GetRequiredService<IConfiguration>();
            
            var version = ReadVersionFromFile() ?? "unknown";
            var environment = configuration["ASPNETCORE_ENVIRONMENT"] ?? "unknown";
            var commitHash = configuration["Build:CommitHash"] ?? 
                           Environment.GetEnvironmentVariable("BUILD_COMMIT_HASH") ?? 
                           "unknown";

            using var scope = logger.BeginScope(new Dictionary<string, object>
            {
                ["DeploymentVersion"] = version,
                ["Environment"] = environment,
                ["CommitHash"] = commitHash,
                ["EventType"] = "ApplicationStart"
            });

            logger.LogInformation(
                "🚀 APPLICATION STARTED - Version: {Version}, Environment: {Environment}, Commit: {CommitHash}",
                version, environment, commitHash);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error logging deployment start: {ex.Message}");
        }
    }
}


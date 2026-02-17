using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using EDR.Application.Extensions;
using EDR.Application.Services;
using EDR.Application.Services.IContract;
using EDR.Domain.Extensions;
using EDR.Domain.Services;
using EDR.API.Extensions;
using EDR.API.Strategies;
using NLog;
using NLog.Extensions.Logging;

namespace EDR.API;

public class Program
{
    public static async Task Main(string[] args)
    {
        AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);
        using var loggerProvider = (NLogLoggerProvider)LoggerWebConfiguration.Configure();
        using var loggerFactory = new NLogLoggerFactory(loggerProvider);
        var logger = loggerFactory.CreateLogger<Program>();

        try
        {
            logger.LogInformation("Starting application");
            WebApplication application = CreateHostBuilder(loggerProvider, args).Build();
            WebApplication configuredApplication = application.ConfigureApplication();
            await configuredApplication.RunAsync().ConfigureAwait(false);
        }
        catch (Exception ex)
        {
            logger.LogCritical(ex, "Failed to start application");
            Environment.ExitCode = -1;
        }
        finally
        {
            logger.LogInformation("The my application has been stopped");
            LogManager.Shutdown();
        }
    }

    private static WebApplicationBuilder CreateHostBuilder(NLogLoggerProvider loggerProvider, string[] args)
    {
        string contentRootPath = Directory.GetCurrentDirectory();
        WebApplicationBuilder builder = WebApplication.CreateBuilder(new WebApplicationOptions()
        {
            Args = args,
            ContentRootPath = contentRootPath
        });

        builder.Configuration
            .AddJsonFile("appsettings.json", optional: false, reloadOnChange: false)
            .AddJsonFile($"appsettings.{builder.Environment.EnvironmentName}.json", optional: true,
                reloadOnChange: false)
            .AddEnvironmentVariables();

        builder.Logging.ClearProviders();
        builder.Logging.AddConfiguration(builder.Configuration.GetSection("Logging"));
        builder.Logging.SetMinimumLevel(Microsoft.Extensions.Logging.LogLevel.Trace);
        builder.Logging.AddProvider(loggerProvider);

        builder.Host.UseDefaultServiceProvider((_, options) =>
        {
            options.ValidateScopes = true;
            options.ValidateOnBuild = true;
        });


        //builder.WebHost.UseKestrel((_, options) => { options.AllowSynchronousIO = true; });
        builder.Services.AddHealthChecks();
        builder.Services.AddCompression();

        builder.Services.AddControllers();
        builder.Services.AddSingleton<IHttpContextAccessor, HttpContextAccessor>();

        builder.Services.AddSingleton<ITenantResolutionStrategy, ClaimsResolutionStrategy>();
        builder.Services.AddSingleton<ITenantResolutionStrategy, HeaderResolutionStrategy>();
        builder.Services.AddSingleton<ITenantResolutionStrategy, DomainResolutionStrategy>();
        builder.Services.AddScoped<ITenantConnectionResolver, TenantConnectionResolver>();

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
        builder.Services.AddAuditServices();
        builder.Services.ConfigureAuditObservers();

        builder.Services.AddScoped<ITenantUserMigrationStrategy, IsolatedTenantUserMigrationStrategy>();
        builder.Services.AddScoped<ITenantUserMigrationStrategy, SharedTenantUserMigrationStrategy>();
        builder.Services.AddScoped<ITenantUserMigrationStrategySelector, TenantUserMigrationStrategySelector>();
        return builder;
    }
}

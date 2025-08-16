using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using NJS.Domain.Extensions;
using NJS.Application.Extensions;
using Microsoft.AspNetCore.Authorization;
using NJSAPI.Extensions;
using NLog.Web;
using Microsoft.Extensions.Options;
using NJSAPI.Configurations;
using NJSAPI.Middleware;
using NJS.Domain.Services;
using Microsoft.Extensions.DependencyInjection.Extensions;
using NJS.Application.Services;

internal class Program
{
    private static async Task Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);

       

        builder.Services.AddControllers();
        builder.Services.AddLogging();

        // Add HttpContextAccessor as singleton
        builder.Services.AddSingleton<IHttpContextAccessor, HttpContextAccessor>();

        builder.Services.AddSingleton<ITenantResolutionStrategy, ClaimsResolutionStrategy>();
        builder.Services.AddSingleton<ITenantResolutionStrategy, HeaderResolutionStrategy>();
        builder.Services.AddSingleton<ITenantResolutionStrategy, DomainResolutionStrategy>();

        // Add tenant resolution strategies in priority order
        //builder.Services.TryAddEnumerable(new[]
        //{
          //  ServiceDescriptor.AddSingleton<ITenantResolutionStrategy, ClaimsResolutionStrategy>(),
            //ServiceDescriptor.AddSingleton<ITenantResolutionStrategy, HeaderResolutionStrategy>(),
            //ServiceDescriptor.AddSingleton<ITenantResolutionStrategy, DomainResolutionStrategy>()
        //});

        // Add tenant services
        builder.Services.AddScoped<ITenantConnectionResolver, TenantConnectionResolver>();
      //  builder.Services.AddScoped<ITenantDatabaseService, TenantDatabaseService>();

        builder.Services.AddDatabaseServices(builder.Configuration);
        builder.Services.AddApplicationServices();
        builder.Services.AddTenantServices(builder.Configuration);
       // builder.Services.AddAndMigrateTenantDatabases(builder.Configuration);

        // Add tenant connection resolver
        //builder.Services.AddScoped<ProjectManagementContextFactory>();

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
        builder.Services.AddAuthorization(options =>
        {
            options.AddPolicy("RequireAdminRole", policy =>
                policy.RequireRole("Admin"));

            options.AddPolicy("RequireManagerRole", policy =>
                policy.RequireRole("Manager"));

            options.AddPolicy("RequireUserRole", policy =>
                policy.RequireRole("User"));

            options.AddPolicy("RequireAdminOrManager", policy =>
                policy.RequireRole("Admin", "Manager"));

            options.DefaultPolicy = new AuthorizationPolicyBuilder()
                .RequireAuthenticatedUser()
                .Build();
        });

        builder.Services.AddCompression();
        builder.Host.UseNLog();
        builder.Services.AddAuditServices();
        builder.Services.ConfigureAuditObservers();

        // Configure the app
        var app = builder.Build();

        // Use CORS before other middleware
        app.UseCors("AllowSpecificOrigin");

        app.UseSwagger();
        app.UseSwaggerUI(options =>
        {
            var swaggerSettings = app.Services.GetRequiredService<IOptions<SwaggerSettings>>().Value;
            options.SwaggerEndpoint($"/swagger/{swaggerSettings.Version}/swagger.json", $"{swaggerSettings.Title}");
        });

       // app.UseTenantCors();
        app.UseResponseCompression();
        app.UseHttpsRedirection();       
        app.UseAuthentication();
        app.UseMiddleware<TenantResolverMiddleware>();
        app.UseAuthorization();
        app.SeedApplicationData();
        app.MapControllers();

        app.Run();
    }
}

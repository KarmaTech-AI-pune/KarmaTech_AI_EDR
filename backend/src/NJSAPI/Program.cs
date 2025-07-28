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
using NJS.Domain.Extensions;
using NJSAPI.Extensions;
using NJSAPI.Middleware;

internal class Program
{
    private static async Task Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);
        builder.Services.AddControllers();
        builder.Services.AddHttpContextAccessor();
        builder.Services.AddLogging();

        builder.Services.AddDatabaseServices(builder.Configuration);
        builder.Services.AddApplicationServices();
        builder.Services.AddTenantServices(builder.Configuration);

        builder.Services.AddEndpointsApiExplorer();
        builder.Services.AddConfiguredSwagger(builder.Configuration);

        builder.Services.AddCors(options =>
        {
            var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>();
            
            // Add tenant subdomains dynamically
            
            
            var allOrigins = allowedOrigins?.ToList() ?? new List<string>();
            //allOrigins.AddRange(tenantSubdomains);
            
            options.AddPolicy("AllowSpecificOrigin",
                builder => builder
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

            // Default policy requiring authentication
            options.DefaultPolicy = new AuthorizationPolicyBuilder()
                .RequireAuthenticatedUser()
                .Build();
        });

        builder.Services.AddCompression();
        builder.Host.UseNLog();
        builder.Services.AddAuditServices();
        builder.Services.ConfigureAuditObservers();

        var app = builder.Build();

        app.UseSwagger();
        app.UseSwaggerUI(options =>
        {
            var swaggerSettings = app.Services.GetRequiredService<IOptions<SwaggerSettings>>().Value;
            options.SwaggerEndpoint($"/swagger/{swaggerSettings.Version}/swagger.json", swaggerSettings.Title);
        });


        // Use CORS before other middleware
        app.UseCors("AllowSpecificOrigin");
        app.UseTenantCors(); // Add custom tenant CORS middleware
        app.UseResponseCompression();
        app.UseHttpsRedirection();
        app.UseMiddleware<TenantResolverMiddleware>();
        app.UseAuthentication();
        app.UseAuthorization();
        app.SeedApplicationData();
        app.MapControllers(); 

        app.Run();
    }
}

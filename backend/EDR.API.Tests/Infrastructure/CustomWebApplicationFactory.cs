using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using EDR.Application.Extensions;
using EDR.Application.Services;
using EDR.Application.Services.IContract;
using EDR.Domain.Database;
using EDR.Domain.Entities;
using EDR.Domain.Extensions;
using EDR.Domain.Services;
using EDR.API.Extensions;
using EDR.API.Strategies;
using System.Security.Claims;
using System.Text;
using System.Text.Encodings.Web;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.Extensions.Options;

namespace EDR.API.Tests.Infrastructure
{
    /// <summary>
    /// Custom WebApplicationFactory that builds the host from scratch,
    /// bypassing Program.Main (which has NLog and SQL Server dependencies
    /// that are incompatible with the test environment).
    /// </summary>
    public class CustomWebApplicationFactory : WebApplicationFactory<EDR.API.Program>
    {
        private readonly string _dbName;

        public CustomWebApplicationFactory(string dbName = null)
        {
            _dbName = dbName ?? Guid.NewGuid().ToString();
        }

        protected override IHost CreateHost(IHostBuilder builder)
        {
            // This is called by WebApplicationFactory but the default IHostBuilder
            // comes from Program.Main which fails silently. We ignore it and build
            // our own WebApplication directly.
            
            var appBuilder = WebApplication.CreateBuilder();

            // Add test configuration values
            appBuilder.Configuration.AddInMemoryCollection(new Dictionary<string, string>
            {
                ["Jwt:Key"] = "TestSecretKeyForIntegrationTests_MustBe32Chars!!",
                ["Jwt:Issuer"] = "TestIssuer",
                ["Jwt:Audience"] = "TestAudience",
                ["Cors:AllowedOrigins:0"] = "http://localhost:3000",
                ["DNS:Env"] = "Development"
            });

            appBuilder.Environment.EnvironmentName = "Testing";

            // --- Core Services (from Program.cs) ---
            appBuilder.Services.AddControllers()
                .AddApplicationPart(typeof(EDR.API.Program).Assembly);

            appBuilder.Services.AddSingleton<IHttpContextAccessor, HttpContextAccessor>();

            // Tenant strategies
            appBuilder.Services.AddSingleton<ITenantResolutionStrategy, ClaimsResolutionStrategy>();
            appBuilder.Services.AddSingleton<ITenantResolutionStrategy, HeaderResolutionStrategy>();
            appBuilder.Services.AddSingleton<ITenantResolutionStrategy, DomainResolutionStrategy>();
            appBuilder.Services.AddScoped<ITenantConnectionResolver, TenantConnectionResolver>();

            // DNS mock for dev/test
            appBuilder.Services.AddScoped<IDNSManagementService, MockDNSManagementService>();

            // --- Database Services (replaced with InMemory) ---
            appBuilder.Services.AddSingleton<ICurrentTenantService>(new StubCurrentTenantService());
            appBuilder.Services.AddSingleton<EDR.Repositories.Interfaces.ITenantService>(new StubTenantService());

            appBuilder.Services.AddDbContext<ProjectManagementContext>((provider, options) =>
            {
                options.UseInMemoryDatabase(_dbName);
                options.EnableSensitiveDataLogging();
            });

            appBuilder.Services.AddDbContext<TenantDbContext>(options =>
            {
                options.UseInMemoryDatabase(_dbName + "_tenant");
            });

            // Identity (required by AddDatabaseServices, but we set it up with InMemory)
            appBuilder.Services.AddIdentity<User, Role>()
                .AddEntityFrameworkStores<ProjectManagementContext>();

            // UnitOfWork & generic repository
            appBuilder.Services.AddScoped<EDR.Domain.UnitWork.IUnitOfWork, EDR.Domain.UnitWork.UnitOfWork>();
            appBuilder.Services.AddScoped(typeof(EDR.Domain.GenericRepository.IRepository<>), typeof(EDR.Domain.GenericRepository.Repository<>));

            // --- Application Services (MediatR, AutoMapper, Repositories) ---
            appBuilder.Services.AddApplicationServices();

            // --- Swagger & CORS (minimal for tests) ---
            appBuilder.Services.AddEndpointsApiExplorer();
            appBuilder.Services.AddConfiguredSwagger(appBuilder.Configuration);
            appBuilder.Services.AddCors(options =>
            {
                options.AddPolicy("AllowSpecificOrigin", policy =>
                    policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod());
            });

            // --- Authentication (Test handler) ---
            appBuilder.Services.AddAuthentication("Test")
                .AddScheme<AuthenticationSchemeOptions, TestAuthHandler>("Test", _ => { });

            appBuilder.Services.PostConfigure<AuthenticationOptions>(options =>
            {
                options.DefaultAuthenticateScheme = "Test";
                options.DefaultChallengeScheme = "Test";
                options.DefaultScheme = "Test";
            });

            // Audit services
            appBuilder.Services.AddAuditServices();
            appBuilder.Services.ConfigureAuditObservers();

            // Tenant migration strategies
            appBuilder.Services.AddScoped<ITenantUserMigrationStrategy, IsolatedTenantUserMigrationStrategy>();
            appBuilder.Services.AddScoped<ITenantUserMigrationStrategy, SharedTenantUserMigrationStrategy>();
            appBuilder.Services.AddScoped<ITenantUserMigrationStrategySelector, TenantUserMigrationStrategySelector>();

            // Use TestServer instead of Kestrel for integration testing
            appBuilder.WebHost.UseTestServer();

            // --- Build the app ---
            var app = appBuilder.Build();

            // --- Configure middleware pipeline (simplified from ConfigureApplication) ---
            app.UseRouting();
            app.UseCors("AllowSpecificOrigin");
            app.UseAuthentication();
            app.UseAuthorization();
            app.MapControllers();

            // Ensure DB is created
            using (var scope = app.Services.CreateScope())
            {
                var db = scope.ServiceProvider.GetRequiredService<ProjectManagementContext>();
                db.Database.EnsureCreated();
            }

            // Start the test host
            app.StartAsync().GetAwaiter().GetResult();

            return app;
        }
    }

    /// <summary>
    /// Stub ICurrentTenantService for testing. Always returns TenantId = 1.
    /// </summary>
    public class StubCurrentTenantService : ICurrentTenantService
    {
        public string ConnectionString { get; set; }
        public int? TenantId { get; set; } = 1;

        public Task<bool> SetTenant(int tenant)
        {
            TenantId = tenant;
            return Task.FromResult(true);
        }

        public Task<List<MigrationResult>> ApplyMigrationsToAllTenantsAsync()
        {
            return Task.FromResult(new List<MigrationResult>());
        }
    }

    /// <summary>
    /// Stub ITenantService for testing. Bypasses TenantDbContext lookups.
    /// </summary>
    public class StubTenantService : EDR.Repositories.Interfaces.ITenantService
    {
        public int? TenantId { get; set; } = 1;

        public Task<string> GetCurrentTenantDomain() => Task.FromResult("localhost");
        public Task<Tenant> GetCurrentTenantAsync() => Task.FromResult(new Tenant { Id = 1, Domain = "localhost", Name = "Test Tenant" });
        public Task<int?> GetCurrentTenantIdAsync() => Task.FromResult<int?>(1);
        public Task<string> GetTenantDomain() => Task.FromResult("localhost");
        public string GetTenantDomainFromClaims() => "localhost";
        public Task<int?> GetTenantId(string domain) => Task.FromResult<int?>(1);
        public int? GetTenantIdFromClaims() => 1;
        public string GetTenantRoleFromClaims() => "Admin";
        public Task<List<TenantUser>> GetTenantUsersByUserIdAsync(string userId) => Task.FromResult(new List<TenantUser>());
        public string GetUserTypeFromClaims() => "TenantUser";
        public bool IsSuperAdminFromClaims() => true;
        public Task<bool> SetTenantContextAsync(string tenantDomain) => Task.FromResult(true);
        public Task<bool> ValidateTenantAccessAsync(string userId, int tenantId) => Task.FromResult(true);
    }

    /// <summary>
    /// Test authentication handler that always authenticates as a test user.
    /// </summary>
    public class TestAuthHandler : AuthenticationHandler<AuthenticationSchemeOptions>
    {
        public TestAuthHandler(
            IOptionsMonitor<AuthenticationSchemeOptions> options,
            ILoggerFactory logger,
            UrlEncoder encoder)
            : base(options, logger, encoder)
        {
        }

        protected override Task<AuthenticateResult> HandleAuthenticateAsync()
        {
            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, "test-user-id"),
                new Claim(ClaimTypes.Name, "testuser@test.com"),
                new Claim(ClaimTypes.Email, "testuser@test.com"),
                new Claim("TenantId", "1"),
            };
            var identity = new ClaimsIdentity(claims, "Test");
            var principal = new ClaimsPrincipal(identity);
            var ticket = new AuthenticationTicket(principal, "Test");

            return Task.FromResult(AuthenticateResult.Success(ticket));
        }
    }
}

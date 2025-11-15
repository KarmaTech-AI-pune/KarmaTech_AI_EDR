using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using NJS.Application.Services.IContract;
using NJS.Domain; // For MigrationResult
using NJS.Domain.Database;
using NJS.Domain.Entities;
using NJS.Domain.Services;

namespace NJSAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class TenantsController : ControllerBase
    {
        private readonly ProjectManagementContext _context;
        private readonly TenantDbContext _tenantDbContext;
        private readonly IDNSManagementService _dnsService;
        private readonly ISubscriptionService _subscriptionService;
        private readonly ILogger<TenantsController> _logger;
        private readonly IDatabaseManagementService _databaseManagementService;
        private readonly ICurrentTenantService _currentTenantService;
        private readonly ITenantMigrationService _tenantMigrationService;
        private readonly IConfiguration _configuration;

        public TenantsController(
            ProjectManagementContext context,
            TenantDbContext tenantDbContext,
            IDNSManagementService dnsService,
            ISubscriptionService subscriptionService,
            IDatabaseManagementService databaseManagementService,
            ICurrentTenantService currentTenantService,
            ITenantMigrationService tenantMigrationService,
            IConfiguration configuration,
            ILogger<TenantsController> logger)
        {
            _context = context;
            _dnsService = dnsService;
            _subscriptionService = subscriptionService;
            _databaseManagementService = databaseManagementService;
            _tenantDbContext = tenantDbContext;
            _currentTenantService = currentTenantService;
            _tenantMigrationService = tenantMigrationService;
            _configuration = configuration;
            _logger = logger;
        }

        // GET: api/tenants
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Tenant>>> GetTenants()
        {
            var result = await _tenantDbContext.Tenants.Where(x => x.IsActive)
                .Include(t => t.SubscriptionPlan)
                .Include(t => t.TenantUsers)
                .Include(t => t.TenantDatabases)
                .ToListAsync();

            return Ok(result);
        }

        // GET: api/tenants/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Tenant>> GetTenant(int id)
        {
            var tenant = await _tenantDbContext.Tenants
                .Include(t => t.SubscriptionPlan)
                .Include(t => t.TenantUsers)
                .Include(t => t.TenantDatabases)
                .FirstOrDefaultAsync(t => t.Id == id);

            if (tenant == null)
            {
                return NotFound();
            }

            return tenant;
        }

        // POST: api/tenants
        [HttpPost]
        public async Task<ActionResult<Tenant>> CreateTenant(Tenant tenant)
        {
            try
            {
                // Validate subdomain
                if (!await _dnsService.ValidateSubdomainAsync(tenant.Domain))
                {
                    return BadRequest(new { message = "Subdomain is not available or invalid" });
                }

                // Create DNS record
                var dnsCreated = await _dnsService.CreateSubdomainAsync(tenant.Domain);
                if (!dnsCreated)
                {
                    return BadRequest(new { message = "Failed to create DNS record" });
                }

                // Create tenant database

                (bool isDbCreated, string dbName, string connectionString) result = await _databaseManagementService.CreateTenantDatabaseAsync(tenant.Domain, tenant.IsIsolated);
                if (!result.isDbCreated)
                {
                    return BadRequest(new { message = "Failed to create tenant database" });
                }
                var tenantDb = new TenantDatabase
                {
                    TenantId = 0, // Will be set after tenant is created
                    DatabaseName = result.dbName,
                    ConnectionString = result.connectionString,
                    Status = DatabaseStatus.Active
                };
                _tenantDbContext.Tenants.Add(tenant);
                await _tenantDbContext.SaveChangesAsync();

                // Update tenant database with correct tenant ID
                tenantDb.TenantId = tenant.Id;
                _tenantDbContext.TenantDatabases.Add(tenantDb);
                await _tenantDbContext.SaveChangesAsync();

                // Execute SQL migration scripts for isolated tenants
                if (tenant.IsIsolated && !string.IsNullOrEmpty(result.connectionString))
                {
                    _logger.LogInformation("Executing migration scripts for tenant {TenantId} database {DatabaseName}", tenant.Id, result.dbName);
                    
                    // Get source database name from configuration for user migration script
                    var sourceDatabaseName = _configuration.GetConnectionString("AppDbConnection");
                    if (!string.IsNullOrEmpty(sourceDatabaseName))
                    {
                        var builder = new Microsoft.Data.SqlClient.SqlConnectionStringBuilder(sourceDatabaseName);
                        sourceDatabaseName = builder.InitialCatalog;
                    }

                    var migrationSuccess = await _tenantMigrationService.ExecuteTenantMigrationsAsync(
                        result.connectionString, 
                        tenant.Id, 
                        sourceDatabaseName);

                    if (!migrationSuccess)
                    {
                        _logger.LogWarning("Some migration scripts failed for tenant {TenantId}, but continuing...", tenant.Id);
                        // Note: We continue even if migrations fail, as some scripts might be optional
                    }
                    else
                    {
                        _logger.LogInformation("Successfully executed all migration scripts for tenant {TenantId}", tenant.Id);
                    }
                }

                // Create subscription if plan is specified
                if (tenant.SubscriptionPlanId.HasValue)
                {
                    await _subscriptionService.CreateTenantSubscriptionAsync(tenant.Id, tenant.SubscriptionPlanId.Value);
                }

                _logger.LogInformation("Created tenant {TenantName} with subdomain {Subdomain}", tenant.Name, tenant.Domain);

                return CreatedAtAction(nameof(GetTenant), new { id = tenant.Id }, tenant);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating tenant {TenantName}", tenant.Name);
                return StatusCode(500, new { message = "An error occurred while creating the tenant" });
            }
        }

        // PUT: api/tenants/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateTenant(int id, Tenant tenant)
        {
            if (id != tenant.Id)
            {
                return BadRequest();
            }

            var existingTenant = await _tenantDbContext.Tenants.FindAsync(id);
            if (existingTenant == null)
            {
                return NotFound();
            }

            // Check if domain changed
            if (existingTenant.Domain != tenant.Domain)
            {
                // Validate new subdomain
                if (!await _dnsService.ValidateSubdomainAsync(tenant.Domain))
                {
                    return BadRequest(new { message = "New subdomain is not available or invalid" });
                }

                // Update DNS record
                var dnsUpdated = await _dnsService.UpdateSubdomainAsync(existingTenant.Domain, tenant.Domain);
                if (!dnsUpdated)
                {
                    return BadRequest(new { message = "Failed to update DNS record" });
                }
            }

            // Update subscription if plan changed
            if (existingTenant.SubscriptionPlanId != tenant.SubscriptionPlanId && tenant.SubscriptionPlanId.HasValue)
            {
                await _subscriptionService.UpdateTenantSubscriptionAsync(tenant.Id, tenant.SubscriptionPlanId.Value);
            }

            _tenantDbContext.Entry(existingTenant).CurrentValues.SetValues(tenant);

            try
            {
                await _tenantDbContext.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!TenantExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // DELETE: api/tenants/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTenant(int id)
        {
            var tenant = await _tenantDbContext.Tenants
                .Include(t => t.TenantDatabases)
                .FirstOrDefaultAsync(t => t.Id == id);

            if (tenant == null)
            {
                return NotFound();
            }

            try
            {
                // Delete DNS record
                await _dnsService.DeleteSubdomainAsync(tenant.Domain);

                // Cancel subscription
                await _subscriptionService.CancelTenantSubscriptionAsync(tenant.Id);

                // Commented out to prevent database deletion
                // var tenantDatabase = tenant.TenantDatabases.FirstOrDefault();
                // if (tenantDatabase != null)
                // {
                //     await _databaseManagementService.DeleteTenantDatabaseAsync(tenantDatabase.DatabaseName);
                // }

                _tenantDbContext.Tenants.Remove(tenant);
                await _tenantDbContext.SaveChangesAsync();

                _logger.LogInformation("Deleted tenant {TenantName} with subdomain {Subdomain}", tenant.Name, tenant.Domain);

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting tenant {TenantName}", tenant.Name);
                return StatusCode(500, new { message = "An error occurred while deleting the tenant" });
            }
        }

        // POST: api/tenants/validate-subdomain
        [HttpPost("validate-subdomain")]
        public async Task<ActionResult<object>> ValidateSubdomain([FromBody] ValidateSubdomainRequest request)
        {
            var isValid = await _dnsService.ValidateSubdomainAsync(request.Subdomain);
            return Ok(new { isValid });
        }

        // POST: api/tenants/suggest-subdomain
        [HttpPost("suggest-subdomain")]
        public async Task<ActionResult<object>> SuggestSubdomain([FromBody] SuggestSubdomainRequest request)
        {
            var suggestions = new List<string>();
            var baseName = request.CompanyName.ToLower().Replace(" ", "").Replace(".", "").Replace(",", "");

            // Generate suggestions
            suggestions.Add(baseName);
            suggestions.Add($"{baseName}app");
            suggestions.Add($"{baseName}pro");
            suggestions.Add($"{baseName}2024");
            suggestions.Add($"{baseName}corp");

            // Filter out taken subdomains
            var availableSuggestions = new List<string>();
            foreach (var suggestion in suggestions)
            {
                if (await _dnsService.ValidateSubdomainAsync(suggestion))
                {
                    availableSuggestions.Add(suggestion);
                }
            }

            return Ok(new { suggestions = availableSuggestions });
        }

        // GET: api/tenants/stats
        [HttpGet("stats")]
        public async Task<ActionResult<object>> GetTenantStats()
        {
            var totalTenants = await _tenantDbContext.Tenants.CountAsync();
            var activeTenants = await _tenantDbContext.Tenants.CountAsync(t => t.Status == TenantStatus.Active);
            var trialTenants = await _tenantDbContext.Tenants.CountAsync(t => t.Status == TenantStatus.Trial);
            var suspendedTenants = await _tenantDbContext.Tenants.CountAsync(t => t.Status == TenantStatus.Suspended);

            return Ok(new
            {
                totalTenants,
                activeTenants,
                trialTenants,
                suspendedTenants,
                totalUsers = await _tenantDbContext.TenantUsers.CountAsync(),
                totalDatabases = await _tenantDbContext.TenantDatabases.CountAsync()
            });
        }

        // GET: api/tenants/{id}/users
        [HttpGet("{id}/users")]
        public async Task<ActionResult<IEnumerable<object>>> GetTenantUsers(int id)
        {
            var tenant = await _tenantDbContext.Tenants.FindAsync(id);
            if (tenant == null)
            {
                return NotFound("Tenant not found");
            }

            var tenantUsers = await _tenantDbContext.TenantUsers
                .Where(tu => tu.TenantId == id)
                .Include(tu => tu.User)
                .Select(tu => new
                {
                    tu.Id,
                    tu.TenantId,
                    tu.UserId,
                    tu.Role,
                    tu.IsActive,
                    tu.JoinedAt,
                    User = new
                    {
                        tu.User.Id,
                        tu.User.UserName,
                        tu.User.Name,
                        tu.User.Email,
                        tu.User.Avatar
                    }
                })
                .ToListAsync();

            return Ok(tenantUsers);
        }

        // POST: api/tenants/{id}/users
        [HttpPost("{id}/users")]
        public async Task<ActionResult<object>> AddTenantUser(int id, [FromBody] AddTenantUserRequest request)
        {
            var tenant = await _tenantDbContext.Tenants.FindAsync(id);
            if (tenant == null)
            {
                return NotFound("Tenant not found");
            }

            var user = await _context.Users.FindAsync(request.UserId);
            if (user == null)
            {
                return NotFound("User not found");
            }

            // Check if user is already assigned to this tenant
            var existingTenantUser = await _tenantDbContext.TenantUsers
                .FirstOrDefaultAsync(tu => tu.TenantId == id && tu.UserId == request.UserId);

            if (existingTenantUser != null)
            {
                return BadRequest("User is already assigned to this tenant");
            }

            var tenantUser = new TenantUser
            {
                TenantId = id,
                UserId = request.UserId,
                Role = request.Role,
                IsActive = request.IsActive,
                JoinedAt = DateTime.UtcNow
            };

            _tenantDbContext.TenantUsers.Add(tenantUser);
            await _tenantDbContext.SaveChangesAsync();

            if (tenant.IsIsolated)
            {
                // Get tenant database connection string
                var tenantDatabase = await _tenantDbContext.TenantDatabases
                    .FirstOrDefaultAsync(td => td.TenantId == tenant.Id);

                if (tenantDatabase == null || string.IsNullOrEmpty(tenantDatabase.ConnectionString))
                {
                    _logger.LogWarning("Tenant database not configured for tenant {TenantId}, skipping user migration", tenant.Id);
                }
                else if (string.IsNullOrEmpty(user.Email))
                {
                    _logger.LogWarning("User {UserId} does not have an email address, skipping user migration", user.Id);
                }
                else
                {
                    // Map TenantUserRole enum to SQL role name
                    var roleName = MapTenantUserRoleToRoleName(request.Role);
                    var permissionName = MapTenantUserRoleToPermissionName(request.Role);

                    // Get source database name from configuration
                    var sourceDatabaseName = _configuration.GetConnectionString("AppDbConnection");
                    if (!string.IsNullOrEmpty(sourceDatabaseName))
                    {
                        var builder = new Microsoft.Data.SqlClient.SqlConnectionStringBuilder(sourceDatabaseName);
                        sourceDatabaseName = builder.InitialCatalog;
                    }

                    _logger.LogInformation("Executing user migration scripts for tenant {TenantId}, user {UserEmail}, role {RoleName}", 
                        tenant.Id, user.Email, roleName);

                    var migrationSuccess = await _tenantMigrationService.ExecuteTenantUserMigrationsAsync(
                        tenantDatabase.ConnectionString,
                        tenant.Id,
                        user.Email,
                        roleName,
                        permissionName,
                        sourceDatabaseName);

                    if (!migrationSuccess)
                    {
                        _logger.LogWarning("User migration scripts failed for tenant {TenantId} and user {UserEmail}, but continuing...", 
                            tenant.Id, user.Email);
                    }
                    else
                    {
                        _logger.LogInformation("Successfully executed user migration scripts for tenant {TenantId} and user {UserEmail}", 
                            tenant.Id, user.Email);
                    }
                }
            }
            else
            {
                user.TenantId = id;
                _context.Users.Update(user);
               await _context.SaveChangesAsync();
            }

            _logger.LogInformation("Added user {UserId} to tenant {TenantId} with role {Role}",
                request.UserId, id, request.Role);

            return CreatedAtAction(nameof(GetTenantUsers), new { id }, tenantUser);
        }

        // PUT: api/tenants/users/{tenantUserId}
        [HttpPut("users/{tenantUserId}")]
        public async Task<ActionResult<object>> UpdateTenantUser(int tenantUserId, [FromBody] UpdateTenantUserRequest request)
        {
            var tenantUser = await _tenantDbContext.TenantUsers.FindAsync(tenantUserId);
            if (tenantUser == null)
            {
                return NotFound("Tenant user not found");
            }

            if (request.Role.HasValue)
            {
                tenantUser.Role = request.Role.Value;
            }

            if (request.IsActive.HasValue)
            {
                tenantUser.IsActive = request.IsActive.Value;
            }

            await _tenantDbContext.SaveChangesAsync();

            _logger.LogInformation("Updated tenant user {TenantUserId} with role {Role} and active status {IsActive}",
                tenantUserId, tenantUser.Role, tenantUser.IsActive);

            return Ok(tenantUser);
        }

        // DELETE: api/tenants/users/{tenantUserId}
        [HttpDelete("users/{tenantUserId}")]
        public async Task<ActionResult> RemoveTenantUser(int tenantUserId)
        {
            var tenantUser = await _tenantDbContext.TenantUsers.FindAsync(tenantUserId);
            if (tenantUser == null)
            {
                return NotFound("Tenant user not found");
            }

            _tenantDbContext.TenantUsers.Remove(tenantUser);
            await _tenantDbContext.SaveChangesAsync();

            _logger.LogInformation("Removed user {UserId} from tenant {TenantId}",
                tenantUser.UserId, tenantUser.TenantId);

            return NoContent();
        }

        [HttpPost("apply-migrations")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ApplyMigrationsToAllTenants()
        {
            try
            {
                var results = await _currentTenantService.ApplyMigrationsToAllTenantsAsync();
                return Ok(new { Results = results });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error applying migrations to all tenants");
                return StatusCode(500, new { Error = ex.Message });
            }
        }

        private bool TenantExists(int id)
        {
            return _tenantDbContext.Tenants.Any(e => e.Id == id);
        }

        /// <summary>
        /// Maps TenantUserRole enum to SQL role name
        /// </summary>
        private string MapTenantUserRoleToRoleName(TenantUserRole role)
        {
            return role switch
            {
                TenantUserRole.Owner => "TenantAdmin",
                TenantUserRole.Admin => "TenantAdmin",
                TenantUserRole.Manager => "Project Manager",
                TenantUserRole.User => "User",
                _ => "User"
            };
        }

        /// <summary>
        /// Maps TenantUserRole enum to permission name
        /// </summary>
        private string MapTenantUserRoleToPermissionName(TenantUserRole role)
        {
            return role switch
            {
                TenantUserRole.Owner => "Tenant_ADMIN",
                TenantUserRole.Admin => "Tenant_ADMIN",
                TenantUserRole.Manager => "CREATE_PROJECT", // Manager gets project creation permission
                TenantUserRole.User => "VIEW_PROJECT", // User gets view permission
                _ => "VIEW_PROJECT"
            };
        }
    }

    public class ValidateSubdomainRequest
    {
        public string Subdomain { get; set; } = string.Empty;
    }

    public class SuggestSubdomainRequest
    {
        public string CompanyName { get; set; } = string.Empty;
    }

    public class AddTenantUserRequest
    {
        public string UserId { get; set; } = string.Empty;
        public TenantUserRole Role { get; set; }
        public bool IsActive { get; set; } = true;
    }

    public class UpdateTenantUserRequest
    {
        public TenantUserRole? Role { get; set; }
        public bool? IsActive { get; set; }
    }
}

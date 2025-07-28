using Microsoft.AspNetCore.Mvc;
using NJS.Domain.Entities;
using NJS.Domain.Database;
using Microsoft.EntityFrameworkCore;
using NJS.Application.Services.IContract;
using NJS.Application.Services;
using Microsoft.Extensions.Logging;

namespace NJSAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TenantsController : ControllerBase
    {
        private readonly ProjectManagementContext _context;
        private readonly IDNSManagementService _dnsService;
        private readonly ISubscriptionService _subscriptionService;
        private readonly ILogger<TenantsController> _logger;
        private readonly IDatabaseManagementService _databaseManagementService;

        public TenantsController(
            ProjectManagementContext context,
            IDNSManagementService dnsService,
            ISubscriptionService subscriptionService,
            IDatabaseManagementService databaseManagementService,
            ILogger<TenantsController> logger)
        {
            _context = context;
            _dnsService = dnsService;
            _subscriptionService = subscriptionService;
            _databaseManagementService = databaseManagementService;
            _logger = logger;
        }

        // GET: api/tenants
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Tenant>>> GetTenants()
        {
            var result = await _context.Tenants
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
            var tenant = await _context.Tenants
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
                var tenantDb = new TenantDatabase
                {
                    TenantId = 0, // Will be set after tenant is created
                    DatabaseName = $"Tenant_{tenant.Domain}",
                    ConnectionString = $"Server=localhost;Database=Tenant_{tenant.Domain};Trusted_Connection=true;TrustServerCertificate=True;MultipleActiveResultSets=true;",
                    Status = DatabaseStatus.Active
                };
                var result = await _databaseManagementService.CreateTenantDatabaseAsync(tenantDb.DatabaseName, tenantDb.ConnectionString);
                if (!result)
                {
                    return BadRequest(new { message = "Failed to create tenant database" });
                }

                _context.Tenants.Add(tenant);
                await _context.SaveChangesAsync();

                // Update tenant database with correct tenant ID
                tenantDb.TenantId = tenant.Id;
                _context.TenantDatabases.Add(tenantDb);
                await _context.SaveChangesAsync();



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

            var existingTenant = await _context.Tenants.FindAsync(id);
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

            _context.Entry(existingTenant).CurrentValues.SetValues(tenant);

            try
            {
                await _context.SaveChangesAsync();
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
            var tenant = await _context.Tenants.FindAsync(id);
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

                _context.Tenants.Remove(tenant);
                await _context.SaveChangesAsync();

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
            var totalTenants = await _context.Tenants.CountAsync();
            var activeTenants = await _context.Tenants.CountAsync(t => t.Status == TenantStatus.Active);
            var trialTenants = await _context.Tenants.CountAsync(t => t.Status == TenantStatus.Trial);
            var suspendedTenants = await _context.Tenants.CountAsync(t => t.Status == TenantStatus.Suspended);

            return Ok(new
            {
                totalTenants,
                activeTenants,
                trialTenants,
                suspendedTenants,
                totalUsers = await _context.TenantUsers.CountAsync(),
                totalDatabases = await _context.TenantDatabases.CountAsync()
            });
        }

        // GET: api/tenants/{id}/users
        [HttpGet("{id}/users")]
        public async Task<ActionResult<IEnumerable<object>>> GetTenantUsers(int id)
        {
            var tenant = await _context.Tenants.FindAsync(id);
            if (tenant == null)
            {
                return NotFound("Tenant not found");
            }

            var tenantUsers = await _context.TenantUsers
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
            var tenant = await _context.Tenants.FindAsync(id);
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
            var existingTenantUser = await _context.TenantUsers
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

            _context.TenantUsers.Add(tenantUser);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Added user {UserId} to tenant {TenantId} with role {Role}", 
                request.UserId, id, request.Role);

            return CreatedAtAction(nameof(GetTenantUsers), new { id }, tenantUser);
        }

        // PUT: api/tenants/users/{tenantUserId}
        [HttpPut("users/{tenantUserId}")]
        public async Task<ActionResult<object>> UpdateTenantUser(int tenantUserId, [FromBody] UpdateTenantUserRequest request)
        {
            var tenantUser = await _context.TenantUsers.FindAsync(tenantUserId);
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

            await _context.SaveChangesAsync();

            _logger.LogInformation("Updated tenant user {TenantUserId} with role {Role} and active status {IsActive}", 
                tenantUserId, tenantUser.Role, tenantUser.IsActive);

            return Ok(tenantUser);
        }

        // DELETE: api/tenants/users/{tenantUserId}
        [HttpDelete("users/{tenantUserId}")]
        public async Task<ActionResult> RemoveTenantUser(int tenantUserId)
        {
            var tenantUser = await _context.TenantUsers.FindAsync(tenantUserId);
            if (tenantUser == null)
            {
                return NotFound("Tenant user not found");
            }

            _context.TenantUsers.Remove(tenantUser);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Removed user {UserId} from tenant {TenantId}", 
                tenantUser.UserId, tenantUser.TenantId);

            return NoContent();
        }

        private bool TenantExists(int id)
        {
            return _context.Tenants.Any(e => e.Id == id);
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

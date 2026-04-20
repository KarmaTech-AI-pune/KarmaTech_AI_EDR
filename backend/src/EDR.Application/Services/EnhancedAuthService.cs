using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;
using EDR.Application.Dtos;
using EDR.Application.Services.IContract;
using EDR.Domain.Database;
using EDR.Domain.Entities;
using EDR.Repositories.Interfaces;
using System.IdentityModel.Tokens.Jwt;
using System.Security.AccessControl;
using System.Security.Claims;
using System.Text;

namespace EDR.Application.Services
{
    public class EnhancedAuthService : IAuthService
    {
        private readonly IConfiguration _configuration;
        private readonly UserManager<User> _userManager;
        private readonly RoleManager<Role> _roleManager;
        private readonly IPermissionRepository _permissionRepository;
        private readonly ITenantService _tenantService;
        private readonly TenantDbContext _tenantDbContext;
        private readonly ILogger<EnhancedAuthService> _logger;

        public EnhancedAuthService(
            IConfiguration configuration,
            UserManager<User> userManager,
            RoleManager<Role> roleManager,
            IPermissionRepository permissionRepository,
            ITenantService tenantService,
            TenantDbContext tenantDbContext,
            ILogger<EnhancedAuthService> logger)
        {
            _configuration = configuration;
            _userManager = userManager;
            _roleManager = roleManager;
            _permissionRepository = permissionRepository;
            _tenantService = tenantService;
            _tenantDbContext = tenantDbContext;
            _logger = logger;
        }

        public async Task<AuthResult> ValidateUserAsync(string email, string password)
        {
            try
            {
                var user = await _userManager.Users.IgnoreQueryFilters().FirstOrDefaultAsync(u => u.NormalizedEmail == email.ToUpper());
                if (user == null)
                {
                    _logger.LogWarning("Login failed: User with email {Email} not found.", email);
                    return AuthResult.Failed(AuthResultType.InvalidCredentials, "Invalid credentials");
                }

                // Global inactivity check - If user is blocked globally, they can't access anything
                if (!user.IsActive)
                {
                    _logger.LogWarning("Login failed: User {Email} is globally inactive.", email);
                    return AuthResult.Failed(AuthResultType.UserInactive, "Your account is inactive. Please contact your administrator.");
                }

                var isSuperAdmin = await IsSuperAdminAsync(user);
                var currentTenantId = await GetCurrentTenantIdAsync();

                // 1. Super Admin logic
                if (isSuperAdmin)
                {
                    // Super Admins are allowed bypass all tenant/user blocks
                    // Check password first before granting bypass
                    var validPwd = await _userManager.CheckPasswordAsync(user, password);
                    if (!validPwd)
                    {
                        return AuthResult.Failed(AuthResultType.InvalidCredentials, "Invalid credentials");
                    }
                    var token = await GenerateJwtTokenAsync(user, null, true, currentTenantId);
                    return AuthResult.Succeeded(user, token);
                }

                // 2. Regular User logic - Check tenant mapping before password
                var userTenants = await _tenantService.GetTenantUsersByUserIdAsync(user.Id);

                // RESOLVE TENANT: If no tenant context is provided, try to find a valid mapping
                if (!currentTenantId.HasValue || (currentTenantId == 1 && (userTenants == null || !userTenants.Any(t => t.TenantId == 1))))
                {
                    if (currentTenantId == 1 && user.TenantId > 1)
                    {
                        currentTenantId = user.TenantId;
                        _logger.LogInformation("Resolved Tenant ID {TenantId} from primary user tenant for {Email}", currentTenantId, email);
                    }
                    else
                    {
                        var firstMapping = userTenants?.FirstOrDefault();
                        if (firstMapping != null)
                        {
                            currentTenantId = firstMapping.TenantId;
                            _logger.LogInformation("Resolved Tenant ID {TenantId} from user mappings for {Email}", currentTenantId, email);
                        }
                        else if (user.TenantId > 0)
                        {
                            currentTenantId = user.TenantId;
                            _logger.LogInformation("Resolved Tenant ID {TenantId} from primary user tenant for {Email}", currentTenantId, email);
                        }
                        else if (!currentTenantId.HasValue)
                        {
                            // Final fallback to Tenant 1
                            currentTenantId = 1;
                            _logger.LogInformation("No tenant context or mappings found. Defaulting to Tenant 1 for user {Email}", email);
                        }
                    }
                }

                // Check Tenant Status (Blocked/Expired)
                var resolvedTenant = await _tenantService.GetTenantByIdentifierAsync(currentTenantId.Value.ToString());
                if (resolvedTenant != null && resolvedTenant.IsBlocked)
                {
                    _logger.LogWarning("Access to tenant {TenantId} is blocked: {Reason}", currentTenantId, resolvedTenant.BlockReason);
                    return AuthResult.Failed(AuthResultType.TenantInactive, resolvedTenant.BlockReason);
                }

                // Check User-Tenant Mapping & Activity
                var mapping = userTenants?.FirstOrDefault(t => t.TenantId == currentTenantId.Value);
                
                bool hasAccess = false;
                bool isActive = false;
                TenantUserRole? tenantRole = null;

                if (mapping != null)
                {
                    hasAccess = true;
                    isActive = mapping.IsActive; // Authority is the TenantUsers mapping table
                    tenantRole = mapping.Role;
                    
                    _logger.LogInformation("Resolved mapping for User {UserId} in Tenant {TenantId}. IsActive: {IsActive}", user.Id, currentTenantId, isActive);
                }
                else if (user.TenantId == currentTenantId.Value)
                {
                    // This is a primary user for this tenant. 
                    // Fallback to the User table status if no explicit mapping exists in TenantUsers.
                    hasAccess = true;
                    isActive = user.IsActive; 
                    tenantRole = TenantUserRole.User;
                    
                    _logger.LogInformation("User {UserId} is a primary user for Tenant {TenantId}. Falling back to global IsActive: {IsActive}", user.Id, currentTenantId, isActive);
                }

                if (!hasAccess)
                {
                    _logger.LogWarning("User {UserId} attempted login to tenant {TenantId} but has no mapping.", user.Id, currentTenantId);
                    return AuthResult.Failed(AuthResultType.NoTenantMapping, "You do not have access to this tenant.");
                }

                if (!isActive)
                {
                    _logger.LogWarning("User {UserId} is inactive for tenant {TenantId}. Login blocked.", user.Id, currentTenantId);
                    return AuthResult.Failed(AuthResultType.UserInactive, "Your account is inactive for this specific tenant. Please contact your administrator.");
                }

                // 3. User is valid and active for the tenant, now check password
                var isValidPassword = await _userManager.CheckPasswordAsync(user, password);
                if (!isValidPassword)
                {
                    _logger.LogWarning("Login failed: Invalid password for user {Email}.", email);
                    return AuthResult.Failed(AuthResultType.InvalidCredentials, "Invalid credentials");
                }

                // Success
                var finalToken = await GenerateJwtTokenAsync(user, tenantRole, false, currentTenantId);
                return AuthResult.Succeeded(user, finalToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error validating user {Email}", email);
                return AuthResult.Failed(AuthResultType.Error, "An internal error occurred during validation");
            }
        }

        public async Task<bool> IsSuperAdminAsync(User user)
        {
            if (user == null) return false;
            var roles = await _userManager.GetRolesAsync(user);
            return roles.Any(r => r.Equals("SuperAdmin", StringComparison.OrdinalIgnoreCase));
        }

        private async Task<int?> GetCurrentTenantIdAsync()
        {
            // Use the tenant service to get the current tenant ID
            return await _tenantService.GetCurrentTenantIdAsync();
        }



        private async Task<string> GenerateJwtTokenAsync(User user, TenantUserRole? tenantRole, bool isSuperAdmin, int? resolvedTenantId)
        {
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, user.Email),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim(ClaimTypes.Name, user.UserName)
            };

            if (isSuperAdmin)
            {
                claims.Add(new Claim("IsSuperAdmin", "true"));
                claims.Add(new Claim("UserType", "SuperAdmin"));
                claims.Add(new Claim("TenantId", "1")); // System admin defaults to main tenant (ID 1)
                
                // Super admin has access to ALL features
                // Get all active features from database
                var allFeatures = await _tenantDbContext.Features
                    .Where(f => f.IsActive)
                    .Select(f => f.Name)
                    .ToListAsync();
                
                if (allFeatures.Any())
                {
                    var featuresString = string.Join(",", allFeatures);
                    claims.Add(new Claim("Features", featuresString));
                }
            }
            else if (tenantRole.HasValue)
            {
                // Get current tenant ID from context or passed resolved value
                var currentTenantId = resolvedTenantId ?? await GetCurrentTenantIdAsync();
                if (currentTenantId.HasValue)
                {
                    claims.Add(new Claim("TenantId", currentTenantId.Value.ToString()));
                    claims.Add(new Claim("TenantRole", tenantRole.Value.ToString()));
                    claims.Add(new Claim("UserType", "TenantUser"));
                    
                    // Add enabled features for this tenant
                    var enabledFeatures = await GetTenantEnabledFeaturesAsync(currentTenantId.Value);
                    if (enabledFeatures.Any())
                    {
                        var featuresString = string.Join(",", enabledFeatures);
                        claims.Add(new Claim("Features", featuresString));
                    }
                    
                    // Add tenant domain for additional context
                    var tenantDomain = await _tenantService.GetCurrentTenantDomain();
                    if (!string.IsNullOrEmpty(tenantDomain))
                    {
                        claims.Add(new Claim("TenantDomain", tenantDomain));
                    }
                }
            }

            // Add role-based permissions
            var roles = await _userManager.GetRolesAsync(user);
            List<string> permissions = new List<string>();

            foreach (var role in roles)
            {
                var roleEntity = await _roleManager.FindByNameAsync(role);
                if (roleEntity != null)
                {
                    claims.Add(new Claim(ClaimTypes.Role, role));
                    var rolePermissions = await _permissionRepository.GetPermissionsByRoleIdAsync(roleEntity.Id);
                    if (rolePermissions != null && rolePermissions.Any())
                    {
                        permissions.AddRange(rolePermissions.Select(p => p.Name));
                    }
                }
            }

            if (permissions.Any())
            {
                var permissionsString = string.Join(",", permissions);
                claims.Add(new Claim("Permissions", permissionsString));
            }

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddHours(3),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
        public async Task<string> GenerateJwtTokenAsync(User user)
        {
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            // Get user roles
            var roles = await _userManager.GetRolesAsync(user);

            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, user.Email),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim(ClaimTypes.Name, user.UserName)
            };

            List<string> permissions = [];
            // Add role claims
            foreach (var role in roles)
            {
                var roleDetils = await _roleManager.FindByNameAsync(role).ConfigureAwait(false);
                if (roleDetils != null)
                {
                    claims.Add(new Claim(ClaimTypes.Role, role));
                    var rolePermissions = await _permissionRepository.GetPermissionsByRoleIdAsync(roleDetils.Id).ConfigureAwait(false);
                    if (rolePermissions != null && rolePermissions.Any())
                    {
                        var permissionsString = string.Join(",", rolePermissions.Select(p => p.Name));
                        claims.Add(new Claim("Permissions", permissionsString));
                    }
                }
            }

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddHours(3),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        public bool VerifyToken(string token)
        {
            if (string.IsNullOrEmpty(token))
                return false;

            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]);

            try
            {
                tokenHandler.ValidateToken(token, new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidIssuer = _configuration["Jwt:Issuer"],
                    ValidAudience = _configuration["Jwt:Audience"],
                    ClockSkew = TimeSpan.Zero
                }, out SecurityToken validatedToken);

                return true;
            }
            catch
            {
                return false;
            }
        }

        public async Task<bool> CreateRoleAsync(string roleName)
        {
            if (!await _roleManager.RoleExistsAsync(roleName))
            {
                var result = await _roleManager.CreateAsync(new Role { Name = roleName });
                return result.Succeeded;
            }
            return true;
        }

        public async Task<bool> AssignRoleToUserAsync(User user, string roleName)
        {
            if (!await _roleManager.RoleExistsAsync(roleName))
            {
                await CreateRoleAsync(roleName);
            }

            var result = await _userManager.AddToRoleAsync(user, roleName);
            return result.Succeeded;
        }

        public async  Task<bool> ValidateUserAnsPasswordAsync(string email, string password)
        {
            var user = await _userManager.FindByEmailAsync(email);
            if (user == null)
            {
                return false;
            }

            var isValidPassword = await _userManager.CheckPasswordAsync(user, password);
            if (!isValidPassword)
            {
                return false;
            }

            return true;
        }

        /// <summary>
        /// Get enabled features for a tenant based on their subscription plan
        /// </summary>
        private async Task<List<string>> GetTenantEnabledFeaturesAsync(int tenantId)
        {
            var tenant = await _tenantDbContext.Tenants
                .Include(t => t.SubscriptionPlan)
                .ThenInclude(sp => sp.SubscriptionPlanFeatures)
                .ThenInclude(spf => spf.Feature)
                .FirstOrDefaultAsync(t => t.Id == tenantId);

            // If it's the main tenant (Tenant 1) and no subscription is found, 
            // or if any tenant has no subscription, default to all active features.
            if (tenant?.SubscriptionPlan == null)
            {
                return await _tenantDbContext.Features
                    .Where(f => f.IsActive)
                    .Select(f => f.Name)
                    .ToListAsync();
            }

            return tenant.SubscriptionPlan.SubscriptionPlanFeatures
                .Where(spf => spf.Feature.IsActive) // Only globally active features
                .Select(spf => spf.Feature.Name)
                .ToList();
        }
    }
}



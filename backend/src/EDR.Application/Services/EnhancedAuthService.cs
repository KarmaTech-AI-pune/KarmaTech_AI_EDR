using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;
using EDR.Application.Dtos;
using EDR.Application.Services.IContract;
using EDR.Domain.Database;
using EDR.Domain.Entities;
using EDR.Repositories.Interfaces;using System.Collections.Generic;
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
                var user = await _userManager.FindByEmailAsync(email);
                if (user == null)
                {
                    _logger.LogWarning("Login failed: User with email {Email} not found.", email);
                    return AuthResult.Failed(AuthResultType.InvalidCredentials, "Invalid credentials");
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

                // If no tenant resolved via host/header, try to find a default active mapping
                if (!currentTenantId.HasValue)
                {
                    var defaultMapping = userTenants?.FirstOrDefault(t => t.IsActive);
                    if (defaultMapping != null)
                    {
                        currentTenantId = defaultMapping.TenantId;
                        _logger.LogInformation("Resolved default tenant {TenantId} for user {Email}", currentTenantId, email);
                    }
                }

                if (!currentTenantId.HasValue)
                {
                    return AuthResult.Failed(AuthResultType.NoTenantMapping, "No tenant context found for this user.");
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
                if (mapping == null)
                {
                    _logger.LogWarning("User {UserId} attempted login to tenant {TenantId} but has no mapping.", user.Id, currentTenantId);
                    return AuthResult.Failed(AuthResultType.NoTenantMapping, "You do not have access to this tenant.");
                }

                if (!mapping.IsActive)
                {
                    _logger.LogWarning("User {UserId} is inactive for tenant {TenantId}. Login blocked.", user.Id, currentTenantId);
                    return AuthResult.Failed(AuthResultType.UserInactive, "Your account is inactive for this tenant. Please contact your administrator.");
                }

                // 3. User is valid and active for the tenant, now check password
                var isValidPassword = await _userManager.CheckPasswordAsync(user, password);
                if (!isValidPassword)
                {
                    _logger.LogWarning("Login failed: Invalid password for user {Email}.", email);
                    return AuthResult.Failed(AuthResultType.InvalidCredentials, "Invalid credentials");
                }

                // Success
                var finalToken = await GenerateJwtTokenAsync(user, mapping.Role, false, currentTenantId);
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
            return roles.Any(r => r.Equals("SuperAdmin", StringComparison.OrdinalIgnoreCase) || 
                                 r.Equals("Admin", StringComparison.OrdinalIgnoreCase));
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
                claims.Add(new Claim("TenantId", "0")); // Super admin has no specific tenant
                
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

            if (tenant?.SubscriptionPlan == null)
                return new List<string>();

            return tenant.SubscriptionPlan.SubscriptionPlanFeatures
                .Where(spf => spf.Feature.IsActive) // Only globally active features
                .Select(spf => spf.Feature.Name)
                .ToList();
        }
    }
}



using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using NJS.Application.Dtos;
using NJS.Application.Services.IContract;
using NJS.Domain.Database;
using NJS.Domain.Entities;
using NJS.Repositories.Interfaces;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.AccessControl;
using System.Security.Claims;
using System.Text;

namespace NJS.Application.Services
{
    public class EnhancedAuthService : IAuthService
    {
        private readonly IConfiguration _configuration;
        private readonly UserManager<User> _userManager;
        private readonly RoleManager<Role> _roleManager;
        private readonly IPermissionRepository _permissionRepository;
        private readonly ITenantService _tenantService;
        private readonly TenantDbContext _tenantDbContext;

        public EnhancedAuthService(
            IConfiguration configuration,
            UserManager<User> userManager,
            RoleManager<Role> roleManager,
            IPermissionRepository permissionRepository,
            ITenantService tenantService,
            TenantDbContext tenantDbContext)
        {
            _configuration = configuration;
            _userManager = userManager;
            _roleManager = roleManager;
            _permissionRepository = permissionRepository;
            _tenantService = tenantService;
            _tenantDbContext = tenantDbContext;
        }

        public async Task<(bool success, User user, string token)> ValidateUserAsync(string email, string password)
        {
            try
            {
                var user = await _userManager.FindByEmailAsync(email);
                if (user == null)
                {
                    return (false, null, null);
                }

                var isValidPassword = await _userManager.CheckPasswordAsync(user, password);
                if (!isValidPassword)
                {
                    return (false, null, null);
                }

                // Check if user is a super admin (has SYSTEM_ADMIN permission)
                var isSuperAdmin = await IsSuperAdminAsync(user);
                
                if (isSuperAdmin)
                {
                    // Super admin can access without tenant context
                    var token = await GenerateJwtTokenAsync(user, null, true, null);
                    return (true, user, token);
                }
                else
                {
                    // Regular user needs tenant context
                    var currentTenantId = await GetCurrentTenantIdAsync();
                    TenantUser tenantUser = null;

                    // Fallback: Check user's tenant associations
                    var userTenants = await _tenantService.GetTenantUsersByUserIdAsync(user.Id);

                    if (!currentTenantId.HasValue)
                    {
                        // Try to find a default tenant for the user
                        if (userTenants != null && userTenants.Any(t => t.IsActive))
                        {
                            tenantUser = userTenants.FirstOrDefault(t => t.IsActive);
                            currentTenantId = tenantUser?.TenantId;
                        }
                        else if (user.TenantId > 0)
                        {
                             // Fallback to User table TenantId
                             currentTenantId = user.TenantId;
                        }
                    }
                    else
                    {
                        // Verify user belongs to the requested tenant
                        tenantUser = userTenants?.FirstOrDefault(t => t.TenantId == currentTenantId.Value && t.IsActive);
                    }

                    if (!currentTenantId.HasValue)
                    {
                        return (false, null, null); // No tenant context resolved
                    }

                    if (tenantUser == null)
                    {
                        // Implicit access if TenantId matches User.TenantId but no TenantUser record exists
                        // Or fail? For now, we allow it if we have a valid TenantId from User table
                        tenantUser = new TenantUser
                        {
                             UserId = user.Id,
                             TenantId = currentTenantId.Value,
                             Role = TenantUserRole.User,
                             IsActive = true
                        };
                    }

                    var token = await GenerateJwtTokenAsync(user, tenantUser.Role, false, currentTenantId);
                    return (true, user, token);
                }
            }
            catch (Exception)
            {
                return (false, null, null);
            }
        }

        private async Task<bool> IsSuperAdminAsync(User user)
        {
            var roles = await _userManager.GetRolesAsync(user);
            foreach (var role in roles)
            {
                var roleEntity = await _roleManager.FindByNameAsync(role);
                if (roleEntity != null)
                {
                    var permissions = await _permissionRepository.GetPermissionsByRoleIdAsync(roleEntity.Id);
                    if (permissions.Any(p => p.Name == "SYSTEM_ADMIN"))
                    {
                        return true;
                    }
                }
            }
            return false;
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
                claims.Add(new Claim("Features", "*")); // Wildcard for all features
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

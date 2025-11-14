using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using NJS.Application.Dtos;
using NJS.Application.Services.IContract;
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

        public EnhancedAuthService(
            IConfiguration configuration,
            UserManager<User> userManager,
            RoleManager<Role> roleManager,
            IPermissionRepository permissionRepository,
            ITenantService tenantService)
        {
            _configuration = configuration;
            _userManager = userManager;
            _roleManager = roleManager;
            _permissionRepository = permissionRepository;
            _tenantService = tenantService;
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
                    var token = await GenerateJwtTokenAsync(user, null, true);
                    return (true, user, token);
                }
                else
                {
                    // Regular user needs tenant context
                    var currentTenantId = await GetCurrentTenantIdAsync();
                    if (!currentTenantId.HasValue)
                    {
                        return (false, null, null); // No tenant context
                    }

                    // Check if user belongs to current tenant
                    var tenantUser = await GetTenantUserAsync(user.Id, currentTenantId.Value);
                    if (tenantUser == null || !tenantUser.IsActive)
                    {
                        return (false, null, null); // User not authorized for this tenant
                    }

                    var token = await GenerateJwtTokenAsync(user, tenantUser.Role, false);
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

        private async Task<TenantUser> GetTenantUserAsync(string userId, int tenantId)
        {
            // This would query the TenantUser table
            // For now, we'll return a mock tenant user for testing
            return new TenantUser
            {
                UserId = userId,
                TenantId = tenantId,
                Role = TenantUserRole.Manager,
                IsActive = true
            };
        }

        private async Task<string> GenerateJwtTokenAsync(User user, TenantUserRole? tenantRole, bool isSuperAdmin)
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
            }
            else if (tenantRole.HasValue)
            {
                // Get current tenant ID from context
                var currentTenantId = await GetCurrentTenantIdAsync();
                if (currentTenantId.HasValue)
                {
                    claims.Add(new Claim("TenantId", currentTenantId.Value.ToString()));
                    claims.Add(new Claim("TenantRole", tenantRole.Value.ToString()));
                    claims.Add(new Claim("UserType", "TenantUser"));
                    
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
                    var rolePermissions = await _permissionRepository.GetPermissionsByRoleIdAsync(roleEntity.Id);
                    if (rolePermissions != null && rolePermissions.Any())
                    {
                        claims.Add(new Claim(ClaimTypes.Role, role));
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
                var rolePermissions = await _permissionRepository.GetPermissionsByRoleIdAsync(roleDetils.Id).ConfigureAwait(false);
                // claims.Add(new Claim(ClaimTypes.Role, role));
                if (rolePermissions != null && rolePermissions.Any())
                {
                    claims.Add(new Claim(ClaimTypes.Role, role));
                    var permissionsString = string.Join(",", rolePermissions.Select(p => p.Name));
                    claims.Add(new Claim("Permissions", permissionsString));
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
    }
}

using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using NJS.Application.Dtos;
using NJS.Application.Services.IContract;
using NJS.Domain.Entities;
using NJS.Domain.Database;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using NJS.Repositories.Interfaces;

namespace NJS.Application.Services
{
    public class TwoFactorService : ITwoFactorService
    {
        private readonly UserManager<User> _userManager;
        private readonly ProjectManagementContext _dbContext;
        private readonly IEmailService _emailService;
        private readonly ILogger<TwoFactorService> _logger;
        private readonly IConfiguration _configuration;
        private readonly IAuthService _authService;
        private readonly RoleManager<Role> _roleManager;
        private readonly IPermissionRepository _permissionRepository;
        private readonly ITenantService _tenantService;
        private readonly IEmailTemplateService _emailTemplateService;

        public TwoFactorService(
            UserManager<User> userManager,
            ProjectManagementContext dbContext,
            IEmailService emailService,
            IAuthService authService,
            ILogger<TwoFactorService> logger,
            IConfiguration configuration,
            RoleManager<Role> roleManager,
            IPermissionRepository permissionRepository,
            ITenantService tenantService,
            IEmailTemplateService emailTemplateService
        )
        {
            _userManager = userManager;
            _dbContext = dbContext;
            _emailService = emailService;
            _logger = logger;
            _configuration = configuration;
            _authService = authService;
            _roleManager = roleManager;
            _permissionRepository = permissionRepository;
            _tenantService = tenantService;
            _emailTemplateService = emailTemplateService;
        }

        public async Task<OtpSentResponse> SendOtpAsync(string email)
        {
            try
            {
                var user = await _userManager.FindByEmailAsync(email);
                if (user == null)
                {
                    return new OtpSentResponse
                    {
                        Success = false,
                        Message = "User not found"
                    };
                }

                // Check if 2FA is enabled for the user
                if (!await IsOtpRequiredAsync(email))
                {
                    return new OtpSentResponse
                    {
                        Success = false,
                        Message = "Two-factor authentication is not enabled for this user"
                    };
                }

                // Generate 6-digit OTP
                var otpCode = GenerateOtpCode();

                // Set expiration (5 minutes from now)
                var expiresAt = DateTime.UtcNow.AddMinutes(5);

                // Save OTP to database
                var twoFactorCode = new TwoFactorCode
                {
                    UserId = user.Id,
                    Code = otpCode,
                    ExpiresAt = expiresAt,
                    TenantId = user.TenantId
                };

                _dbContext.TwoFactorCodes.Add(twoFactorCode);
                await _dbContext.SaveChangesAsync();

                // Send OTP via email
                await SendOtpEmailAsync(user.Email ?? string.Empty, otpCode);

                _logger.LogInformation($"OTP sent to user {email}");

                return new OtpSentResponse
                {
                    Success = true,
                    Message = "OTP sent successfully",
                    Email = email
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending OTP to {Email}", email);
                return new OtpSentResponse
                {
                    Success = false,
                    Message = "Failed to send OTP"
                };
            }
        }

        public async Task<TwoFactorResponse> VerifyOtpAsync(string email, string otpCode)
        {
            try
            {
                var user = await _userManager.FindByEmailAsync(email);
                if (user == null)
                {
                    return new TwoFactorResponse
                    {
                        Success = false,
                        Message = "User not found"
                    };
                }

                var isValid = await ValidateOtpAsync(email, otpCode);
                if (!isValid)
                {
                    return new TwoFactorResponse
                    {
                        Success = false,
                        Message = "Invalid or expired OTP"
                    };
                }

                // Mark OTP as used
                var twoFactorCode = await _dbContext.TwoFactorCodes
                    .Where(t => t.UserId == user.Id && t.Code == otpCode && !t.IsUsed)
                    .FirstOrDefaultAsync();

                if (twoFactorCode != null)
                {
                    twoFactorCode.IsUsed = true;
                    await _dbContext.SaveChangesAsync();
                }

                // Use the same authentication logic as the original login process
                // Since we've already verified the OTP, we can proceed with token generation
                var token = await GenerateJwtTokenWithTenantInfoAsync(user);

                // Create user DTO with the same structure as the original login
                var userDto = await CreateUserDtoAsync(user);

                return new TwoFactorResponse
                {
                    Success = true,
                    Message = "OTP verified successfully",
                    RequiresOtp = false,
                    Token = token,
                    User = userDto
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error verifying OTP for {Email}", email);
                return new TwoFactorResponse
                {
                    Success = false,
                    Message = "Failed to verify OTP"
                };
            }
        }

        public async Task<bool> ValidateOtpAsync(string email, string otpCode)
        {
            try
            {
                var user = await _userManager.FindByEmailAsync(email);
                if (user == null) return false;

                var twoFactorCode = await _dbContext.TwoFactorCodes
                    .Where(t => t.UserId == user.Id &&
                                t.Code == otpCode &&
                                !t.IsUsed &&
                                t.ExpiresAt > DateTime.UtcNow)
                    .FirstOrDefaultAsync();

                return twoFactorCode != null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error validating OTP for {Email}", email);
                return false;
            }
        }

        public async Task<bool> IsOtpRequiredAsync(string email)
        {
            try
            {
                var user = await _userManager.FindByEmailAsync(email);
                if (user == null) return false;

                // Check if 2FA is enabled for this specific user
                return user.TwoFactorEnabled;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking if OTP is required for {Email}", email);
                return false;
            }
        }

        public async Task<bool> EnableTwoFactorAsync(string userId)
        {
            try
            {
                var user = await _userManager.FindByIdAsync(userId);
                if (user == null) return false;

                user.TwoFactorEnabled = true;
                var result = await _userManager.UpdateAsync(user);
                return result.Succeeded;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error enabling 2FA for user {UserId}", userId);
                return false;
            }
        }

        public async Task<bool> DisableTwoFactorAsync(string userId)
        {
            try
            {
                var user = await _userManager.FindByIdAsync(userId);
                if (user == null) return false;

                user.TwoFactorEnabled = false;
                var result = await _userManager.UpdateAsync(user);
                return result.Succeeded;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error disabling 2FA for user {UserId}", userId);
                return false;
            }
        }

        private string GenerateOtpCode()
        {
            using var rng = RandomNumberGenerator.Create();
            var bytes = new byte[4];
            rng.GetBytes(bytes);
            var random = BitConverter.ToUInt32(bytes, 0);
            return (random % 1000000).ToString("D6");
        }

        private async Task SendOtpEmailAsync(string email, string otpCode)
        {
            var template = await _emailTemplateService.GetTemplateAsync("otp-login");
            var renderedTemplate = _emailTemplateService.RenderTemplate(template, new Dictionary<string, string>
            {
                { "OTP_CODE", otpCode }
            });

            var message = new NJS.Domain.Models.EmailMessage
            {
                To = email,
                Subject = "Your Login OTP Code",
                Body = renderedTemplate,
                IsHtml = true
            };

            await _emailService.SendEmailAsync(message);
        }

        private async Task<string> GenerateJwtTokenAsync(User user)
        {
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"] ?? string.Empty));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            // Get user roles
            var roles = await _userManager.GetRolesAsync(user);

            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, user.Email ?? string.Empty),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim(ClaimTypes.Name, user.UserName ?? string.Empty),
                new Claim("TenantId", user.TenantId.ToString())
            };

            // Add role claims
            foreach (var role in roles)
            {
                claims.Add(new Claim(ClaimTypes.Role, role));
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

        private async Task<string> GenerateJwtTokenWithTenantInfoAsync(User user)
        {
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"] ?? string.Empty));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, user.Email ?? string.Empty),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim(ClaimTypes.Name, user.UserName ?? string.Empty)
            };

            // Check if user is a super admin (has SYSTEM_ADMIN permission)
            var isSuperAdmin = await IsSuperAdminAsync(user);

            if (isSuperAdmin)
            {
                claims.Add(new Claim("IsSuperAdmin", "true"));
                claims.Add(new Claim("UserType", "SuperAdmin"));
                claims.Add(new Claim("TenantId", "0")); // Super admin has no specific tenant
            }
            else
            {
                // Regular user needs tenant context
                var currentTenantId = await GetCurrentTenantIdAsync();
                if (currentTenantId.HasValue)
                {
                    claims.Add(new Claim("TenantId", currentTenantId.Value.ToString()));
                    claims.Add(new Claim("UserType", "TenantUser"));

                    // Add tenant domain for additional context
                    var tenantDomain = await _tenantService.GetCurrentTenantDomain();
                    if (!string.IsNullOrEmpty(tenantDomain))
                    {
                        claims.Add(new Claim("TenantDomain", tenantDomain));
                    }
                }
                else
                {
                    // Fallback to user's tenant ID
                    claims.Add(new Claim("TenantId", user.TenantId.ToString()));
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

        private async Task<UserDto> CreateUserDtoAsync(User user)
        {
            // Get user roles
            var roles = await _userManager.GetRolesAsync(user);
            var roleDtos = new List<RoleDto>();

            // Get permissions for each role
            var allPermissions = new List<string>();
            foreach (var roleName in roles)
            {
                var roleEntity = await _roleManager.FindByNameAsync(roleName);
                if (roleEntity != null)
                {
                    var rolePermissions = await _permissionRepository.GetPermissionsByRoleIdAsync(roleEntity.Id);
                    if (rolePermissions != null && rolePermissions.Any())
                    {
                        roleDtos.Add(new RoleDto
                        {
                            Id = roleEntity.Id,
                            Name = roleEntity.Name ?? string.Empty
                        });
                        allPermissions.AddRange(rolePermissions.Select(p => p.Name));
                    }
                }
            }

            // Get tenant information
            var currentTenant = await _tenantService.GetCurrentTenantAsync();
            var tenantId = currentTenant?.Id ?? user.TenantId;
            var tenantDomain = currentTenant?.Domain;


            return new UserDto
            {
                Id = user.Id,
                UserName = user.UserName ?? string.Empty,
                Name = user.Name ?? string.Empty,
                Email = user.Email ?? string.Empty,
                StandardRate = user.StandardRate ?? 0,
                IsConsultant = user.IsConsultant,
                Avatar = user.Avatar ?? string.Empty,
                Roles = roleDtos,
                Permissions = allPermissions.Distinct().ToList(),
                CreatedAt = user.CreatedAt,
                UpdatedAt = user.CreatedAt, // Use CreatedAt as fallback since UpdatedAt might not be set
                TenantId = tenantId,
                TenantDomain = tenantDomain,
                TwoFactorEnabled = user.TwoFactorEnabled
            };
        }

        public async Task<bool> IsTwoFactorEnabledAsync(string userId)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null) return false;

            return user.TwoFactorEnabled;
        }
    }
}

using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using NJS.Application.Services.IContract;
using NJS.Domain.Entities;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace NJS.Application.Services{
  
    public class AuthService: IAuthService
    {
        private readonly IConfiguration _configuration;
        private readonly UserManager<User> _userManager;
        private readonly RoleManager<Role> _roleManager;

        public AuthService(
            IConfiguration configuration,
            UserManager<User> userManager,
            RoleManager<Role> roleManager)
        {
            _configuration = configuration;
            _userManager = userManager;
            _roleManager = roleManager;
        }

        public async Task<(bool success, User user, string token)> ValidateUserAsync(string username, string password)
        {
            try
            {
                var user = await _userManager.FindByNameAsync(username);
                if (user == null)
                {
                    return (false, null, null);
                }

                var isValidPassword = await _userManager.CheckPasswordAsync(user, password);
                if (!isValidPassword)
                {
                    return (false, null, null);
                }

                // Generate JWT token
                var token = await GenerateJwtTokenAsync(user);

                // Update last login time
                user.LastLogin = DateTime.UtcNow;
                await _userManager.UpdateAsync(user);

                return (true, user, token);
            }
            catch (Exception)
            {
                return (false, null, null);
            }
        }

        private async Task<string> GenerateJwtTokenAsync(User user)
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

            if (!await _userManager.IsInRoleAsync(user, roleName))
            {
                var result = await _userManager.AddToRoleAsync(user, roleName);
                return result.Succeeded;
            }
            return true;
        }
    }
}

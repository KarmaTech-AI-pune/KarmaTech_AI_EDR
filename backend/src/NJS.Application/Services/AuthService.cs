//File: backend/src/NJS.Application/Services/AuthService.cs
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using NJS.Domain.Entities;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace NJS.Application.Services
{
    public class AuthService
    {
        private readonly IConfiguration _configuration;
        
        // Hardcoded demo user - in real applications, this should come from a secure database
        private static readonly User DemoUser = new User
        {
            Id = 1,
            Username = "admin",
            // This is the hashed version of "password" using BCrypt
            //PasswordHash = "$2a$11$k7R1o/K7E1XR3CXfNcXYMe/hEJwNx3kHfKT8QrW4Sy.CRqkU3H9Nu",
            PasswordHash ="password",
            Name = "Admin User",
            Email = "admin@example.com",
            Avatar = null,
            CreatedAt = DateTime.UtcNow,
            LastLogin = null
        };

        public AuthService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public (bool success, User user, string token) ValidateUser(string username, string password)
        {
            try
            {
                // Check if username matches
                if (username != DemoUser.Username)
                {
                    return (false, null, null);
                }

                // Verify password using BCrypt
                if (password != DemoUser.PasswordHash)
                {
                    return (false, null, null);
                }

                // Generate JWT token
                var token = GenerateJwtToken(DemoUser);

                // Update last login time
                DemoUser.LastLogin = DateTime.UtcNow;

                return (true, DemoUser, token);
            }
            catch (Exception)
            {
                return (false, null, null);
            }
        }

        private string GenerateJwtToken(User user)
        {
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, user.Email),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim("name", user.Name)
            };

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
    }
}
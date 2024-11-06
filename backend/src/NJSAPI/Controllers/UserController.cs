// File: backend/src/NJSAPI/Controllers/UserController.cs
// Purpose: Controller for handling user-related requests
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using NJS.Application.Services;
using NJS.Application.Dtos;

namespace NJSAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserController : ControllerBase
    {
        private readonly AuthService _authService;
        private readonly ILogger<UserController> _logger;

        public UserController(AuthService authService, ILogger<UserController> logger)
        {
            _authService = authService;
            _logger = logger;
        }

        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginModel model)
        {
            try
            {
                if (model == null || string.IsNullOrEmpty(model.Username) || string.IsNullOrEmpty(model.Password))
                {
                    return BadRequest(new { success = false, message = "Invalid login data" });
                }

                var (success, user, token) = _authService.ValidateUser(model.Username, model.Password);

                if (success)
                {
                    var userDto = new UserDto
                    {
                        Id = user.Id,
                        Name = user.Name,
                        Email = user.Email,
                        Avatar = user.Avatar
                    };

                    return Ok(new { 
                        success = true, 
                        message = "Login successful",
                        token = token,
                        user = userDto
                    });
                }

                return Unauthorized(new { success = false, message = "Invalid credentials" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred during login");
                return StatusCode(500, new { success = false, message = "An error occurred during login" });
            }
        }

        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
        [HttpGet("me")]
        public IActionResult GetCurrentUser()
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                
                if (string.IsNullOrEmpty(userId) || !int.TryParse(userId, out int id))
                {
                    return Unauthorized(new { success = false, message = "Invalid token" });
                }

                // Since we only have one demo user, we can validate the ID matches
                if (id != 1) // DemoUser's ID is 1
                {
                    return NotFound(new { success = false, message = "User not found" });
                }

                // Return the demo user data
                var userDto = new UserDto
                {
                    Id = 1,
                    Name = "Admin User",
                    Email = "admin@example.com",
                    Avatar = null!
                };

                return Ok(new { success = true, user = userDto });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while fetching user data");
                return StatusCode(500, new { success = false, message = "An error occurred while fetching user data" });
            }
        }

        [Authorize]
        [HttpPost("logout")]
        public IActionResult Logout()
        {
            // Since we're using JWT tokens, we don't need to do anything server-side
            // The client will handle removing the token
            return Ok(new { success = true, message = "Logged out successfully" });
        }

        [Authorize]
        [HttpGet("verify")]
        public IActionResult VerifyToken()
        {
            // The [Authorize] attribute already verifies the token
            // If we reach this point, the token is valid
            return Ok(new { valid = true });
        }
    }
}

    /*public class LoginModel
    {
        public string Username { get; set; }
        public string Password { get; set; }
    }
}*/
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using NJS.Application.Services;
using NJS.Application.Dtos;
using NJS.Domain.Entities;
using NJS.Application.Services.IContract;

namespace NJSAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly UserManager<User> _userManager;
        private readonly ILogger<UserController> _logger;

        public UserController(
            IAuthService authService,
            UserManager<User> userManager,
            ILogger<UserController> logger)
        {
            _authService = authService;
            _userManager = userManager;
            _logger = logger;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginModel model)
        {
            try
            {
                if (model == null || string.IsNullOrEmpty(model.Username) || string.IsNullOrEmpty(model.Password))
                {
                    return BadRequest(new { success = false, message = "Invalid login data" });
                }

                var (success, user, token) = await _authService.ValidateUserAsync(model.Username, model.Password);

                if (success)
                {
                    var roles = await _userManager.GetRolesAsync(user);
                    
                    var userDto = new UserDto
                    {
                        Id = user.Id,
                        Name = user.UserName,
                        Email = user.Email,
                        Avatar = user.Avatar,
                        Roles = roles.ToList()
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
        public async Task<IActionResult> GetCurrentUser()
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(new { success = false, message = "Invalid token" });
                }

                var user = await _userManager.FindByIdAsync(userId);
                if (user == null)
                {
                    return NotFound(new { success = false, message = "User not found" });
                }

                var roles = await _userManager.GetRolesAsync(user);
                var userDto = new UserDto
                {
                    Id = user.Id,
                    Name = user.UserName,
                    Email = user.Email,
                    Avatar = user.Avatar,
                    Roles = roles.ToList()
                };

                return Ok(new { success = true, user = userDto });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while fetching user data");
                return StatusCode(500, new { success = false, message = "An error occurred while fetching user data" });
            }
        }

        [Authorize(Policy = "RequireAdminRole")]
        [HttpPost("assign-role")]
        public async Task<IActionResult> AssignRole([FromBody] AssignRoleModel model)
        {
            try
            {
                var user = await _userManager.FindByIdAsync(model.UserId);
                if (user == null)
                {
                    return NotFound(new { success = false, message = "User not found" });
                }

                var result = await _authService.AssignRoleToUserAsync(user, model.Role);
                if (result)
                {
                    return Ok(new { success = true, message = $"Role {model.Role} assigned successfully" });
                }

                return BadRequest(new { success = false, message = "Failed to assign role" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while assigning role");
                return StatusCode(500, new { success = false, message = "An error occurred while assigning role" });
            }
        }

        [Authorize(Policy = "RequireAdminRole")]
        [HttpGet("users")]
        public async Task<IActionResult> GetUsers()
        {
            try
            {
                var users = _userManager.Users.ToList();
                var userDtos = new List<UserDto>();

                foreach (var user in users)
                {
                    var roles = await _userManager.GetRolesAsync(user);
                    userDtos.Add(new UserDto
                    {
                        Id = user.Id,
                        Name = user.UserName,
                        Email = user.Email,
                        Avatar = user.Avatar,
                        Roles = roles.ToList()
                    });
                }

                return Ok(new { success = true, users = userDtos });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while fetching users");
                return StatusCode(500, new { success = false, message = "An error occurred while fetching users" });
            }
        }

        [Authorize]
        [HttpPost("logout")]
        public IActionResult Logout()
        {
            return Ok(new { success = true, message = "Logged out successfully" });
        }

        [Authorize]
        [HttpGet("verify")]
        public IActionResult VerifyToken()
        {
            return Ok(new { valid = true });
        }
    }

  
}

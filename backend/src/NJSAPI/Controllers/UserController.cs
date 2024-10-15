// File: backend/src/controllers/UserController.cs
// Purpose: Controller for handling user-related requests
using Microsoft.AspNetCore.Mvc;
using NJSAPI.Services;
using Microsoft.Extensions.Logging;
using System;

namespace NJSAPI.Controllers
{
    [ApiController]
    [Route("api/user")]
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
                    return BadRequest("Invalid login data");
                }

                if (_authService.ValidateUser(model.Username, model.Password))
                {
                    return Ok(new { success = true, message = "Login successful" });
                }
                return Unauthorized(new { success = false, message = "Invalid credentials" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred during login");
                return StatusCode(500, "An error occurred during login. Please try again later.");
            }
        }
    }

    public class LoginModel
    {
        public string Username { get; set; }
        public string Password { get; set; }
    }
}
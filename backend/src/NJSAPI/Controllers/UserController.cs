using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using NJS.Application.CQRS.Users.Commands;
using NJS.Application.CQRS.Users.Queries;
using NJS.Application.Dtos;
using NJS.Application.Services.IContract;
using NJS.Domain.Entities;
using NJS.Repositories.Interfaces;
using NJS.Domain.Models;

namespace NJSAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]

    public class UserController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly IAuthService _authService;
        private readonly UserManager<User> _userManager;
        private readonly ILogger<UserController> _logger;
        private readonly ITenantService _tenantService;
        private readonly ITwoFactorService _twoFactorService;
        private readonly IEmailService _emailService;
        private readonly IConfiguration _configuration;

        public UserController(
            IAuthService authService,
            UserManager<User> userManager, 
            IMediator mediator,
            ITenantService tenantService,
            ITwoFactorService twoFactorService,
            IEmailService emailService,
            IConfiguration configuration,
            ILogger<UserController> logger
           )
        {
            _authService = authService;
            _userManager = userManager;
            _logger = logger;
            _mediator = mediator;
            _tenantService = tenantService;
            _twoFactorService = twoFactorService;
            _emailService = emailService;
            _configuration = configuration;
        }

        public class ChangePasswordRequest
        {
            public string CurrentPassword { get; set; }
            public string NewPassword { get; set; }
        }

        public class ForgotPasswordRequest
        {
            public string Email { get; set; }
        }

        public class ResetPasswordRequest
        {
            public string Token { get; set; }
            public string Email { get; set; }
            public string NewPassword { get; set; }
        }

        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<IActionResult> Login([FromBody] LoginModel model)
        {
            try
            {
                if (model == null || string.IsNullOrEmpty(model.Email) || string.IsNullOrEmpty(model.Password))
                {
                    return BadRequest(new { success = false, message = "Invalid login data" });
                }

                // Check for tenant context in headers
                var tenant = model.Tenant ?? Request.Headers["X-Tenant-Context"].FirstOrDefault();

                if (!string.IsNullOrEmpty(tenant))
                {
                    await _tenantService.SetTenantContextAsync(tenant);
                    _logger.LogInformation($"Login attempt for tenant: {tenant}");
                }

                var (success, user, token) = await _authService.ValidateUserAsync(model.Email, model.Password);

                if (success)
                {
                    // Check if 2FA is required for this user
                   
                    if (await _twoFactorService.IsOtpRequiredAsync(model.Email))
                    {
                        // Send OTP and return response indicating 2FA is required
                        var otpResult = await _twoFactorService.SendOtpAsync(model.Email);
                        
                        if (otpResult.Success)
                        {
                            return Ok(new
                            {
                                success = true,
                                message = "Credentials valid. OTP sent to your email for verification.",
                                requiresOtp = true,
                                email = model.Email
                            });
                        }
                        else
                        {
                            return BadRequest(new { success = false, message = otpResult.Message });
                        }
                    }

                    // If no 2FA required, proceed with normal login
                    var userDto = new UserDto
                    {
                        Id = user?.Id ?? string.Empty,
                        UserName = user?.UserName ?? string.Empty,
                        Email = user?.Email ?? string.Empty,
                        Avatar = user?.Avatar ?? string.Empty,
                        TwoFactorEnabled=user.TwoFactorEnabled
                    };

                    // Get tenant information for the logged-in user
                    var currentTenant = await _tenantService.GetCurrentTenantAsync();
                    if (currentTenant != null)
                    {
                        userDto.TenantId = currentTenant.Id;
                        userDto.TenantDomain = currentTenant.Domain;
                    }

                    // Extract features from JWT token and add to response
                    var tokenHandler = new System.IdentityModel.Tokens.Jwt.JwtSecurityTokenHandler();
                    var jwtToken = tokenHandler.ReadJwtToken(token);
                    var featuresClaim = jwtToken.Claims.FirstOrDefault(c => c.Type == "Features")?.Value;
                    
                    if (!string.IsNullOrEmpty(featuresClaim))
                    {
                        if (featuresClaim == "*")
                        {
                            // Super admin has all features
                            userDto.Features = new List<string> { "*" };
                        }
                        else
                        {
                            // Parse comma-separated features
                            userDto.Features = featuresClaim.Split(',', StringSplitOptions.RemoveEmptyEntries)
                                .Select(f => f.Trim())
                                .ToList();
                        }
                    }

                    return Ok(new
                    {
                        success = true,
                        message = "Login successful",
                        token = token,
                        user = userDto,
                        requiresOtp = false
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
        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] GetAllUsersQuery query)
        {
            query.PageSize = 10000;
            var result = await _mediator.Send(query);
            return Ok(result);
        }

        [HttpGet("{id}")]
        [Authorize]
        public async Task<IActionResult> GetById(string id)
        {
            var query = new GetUserByIdQuery(id);
            var result = await _mediator.Send(query);

            if (result == null)
                return NotFound();

            return Ok(result);
        }

        [HttpPost("Create")]
        [Authorize]
        public async Task<IActionResult> Create([FromBody] List<CreateUserCommand> commands)
        {
            var createdUsers = new List<UserDto>();
            foreach (var command in commands)
            {
                command.Password = "Admin@123";

                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                try
                {
                    var result = await _mediator.Send(command);
                    if (result != null)
                    {
                        createdUsers.Add(result);
                    }
                }
                catch (ApplicationException ex)
                {
                    // Log the error for individual user creation but continue processing others
                    _logger.LogError(ex, "Error creating user: {Email}", command.Email);
                }
            }

            if (createdUsers.Any())
            {
                return Ok(new { CreatedCount = createdUsers.Count, CreatedUsers = createdUsers });
            }
            else
            {
                return BadRequest(new { message = "No users were created." });
            }
        }

        [HttpPut("{id}")]       
        [Authorize]
        public async Task<IActionResult> Update(string id, [FromBody] UpdateUserCommand command)
        {
            if (id != command.Id)
                return BadRequest("ID mismatch");

            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _mediator.Send(command);
            return Ok(result);
        }

        [HttpDelete("{id}")]       
        public async Task<IActionResult> Delete(string id)
        {
            var command = new DeleteUserCommand(id);
            var result = await _mediator.Send(command);

            if (!result)
                return NotFound();

            return CreatedAtAction(nameof(GetAll), new { });
        }

        [HttpGet("roles")]
        public async Task<IActionResult> GetRoles()
        {
            var query = new GetAllRolesQuery();
            var roles = await _mediator.Send(query);
            return Ok(roles);
        }

        [HttpGet("by-role/{roleName}")]
        public async Task<IActionResult> GetUsersByRole(string roleName)
        {
            var query = new GetUsersByRoleNameQuery(roleName);
            var users = await _mediator.Send(query);
            return Ok(users);
        }

        [HttpGet("permissions")]
        public async Task<IActionResult> GetPermissions()
        {
            var query = new GetAllPermissionsQuery();
            var permissions = await _mediator.Send(query);
            return Ok(permissions);
        }

        [HttpPost("change-password")]
        [Authorize]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
        {
            try
            {
                if (request == null || string.IsNullOrWhiteSpace(request.CurrentPassword) || string.IsNullOrWhiteSpace(request.NewPassword))
                {
                    return BadRequest(new { success = false, message = "Current and new password are required" });
                }

                var user = await _userManager.GetUserAsync(User);
                if (user == null)
                {
                    return Unauthorized(new { success = false, message = "User not found or not authenticated" });
                }

                var isCurrentValid = await _userManager.CheckPasswordAsync(user, request.CurrentPassword);
                if (!isCurrentValid)
                {
                    return BadRequest(new { success = false, message = "Current password is incorrect" });
                }

                var result = await _userManager.ChangePasswordAsync(user, request.CurrentPassword, request.NewPassword);
                if (!result.Succeeded)
                {
                    var errorMessage = result.Errors != null && result.Errors.Any()
                        ? string.Join("; ", result.Errors.Select(e => e.Description))
                        : "Failed to change password";
                    return BadRequest(new { success = false, message = errorMessage });
                }

                return Ok(new { success = true, message = "Password changed successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while changing password");
                return StatusCode(500, new { success = false, message = "An error occurred while changing password" });
            }
        }

        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request)
        {
            try
            {
                if (request == null || string.IsNullOrWhiteSpace(request.Email))
                {
                    return BadRequest(new { success = false, message = "Email is required" });
                }

                var user = await _userManager.FindByEmailAsync(request.Email);
                if (user == null)
                {
                    // Don't reveal that the user does not exist
                    return Ok(new { success = true, message = "If an account exists with this email, a password reset link has been sent." });
                }

                // Generate password reset token
                var token = await _userManager.GeneratePasswordResetTokenAsync(user);

                // Use frontend URL for reset link

                var frontendUrl = _configuration["ResetPassword:FrontEndUrl"];
                var resetLink = $"{frontendUrl}/reset-password?token={Uri.EscapeDataString(token)}&email={Uri.EscapeDataString(user.Email)}";

                // Send email with reset link
                var message = new EmailMessage
                {
                    To = user.Email,
                    Subject = "Password Reset Request",
                    Body = $@"
                        <h2>Password Reset Request</h2>
                        <p>A password reset has been requested for your account.</p>
                        <p>Click the link below to reset your password:</p>
                        <p><a href='{resetLink}'>Reset Password</a></p>
                        <p>If you did not request this reset, please ignore this email.</p>
                        <p>This link will expire in 24 hours.</p>",
                    IsHtml = true
                };

                await _emailService.SendEmailAsync(message);

                return Ok(new { success = true, message = "If an account exists with this email, a password reset link has been sent." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred during password reset request");
                return StatusCode(500, new { success = false, message = "An error occurred while processing your request" });
            }
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
        {
            try
            {
                if (request == null || string.IsNullOrWhiteSpace(request.Token) || 
                    string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.NewPassword))
                {
                    return BadRequest(new { success = false, message = "Token, email, and new password are required" });
                }

                var user = await _userManager.FindByEmailAsync(request.Email);
                if (user == null)
                {
                    // Don't reveal that the user does not exist
                    return BadRequest(new { success = false, message = "Invalid password reset request" });
                }

                var result = await _userManager.ResetPasswordAsync(user, request.Token, request.NewPassword);
                if (!result.Succeeded)
                {
                    var errorMessage = result.Errors != null && result.Errors.Any()
                        ? string.Join("; ", result.Errors.Select(e => e.Description))
                        : "Failed to reset password";
                    return BadRequest(new { success = false, message = errorMessage });
                }

                // Send confirmation email
                var message = new EmailMessage
                {
                    To = user.Email,
                    Subject = "Password Reset Successful",
                    Body = @"
                        <h2>Password Reset Successful</h2>
                        <p>Your password has been successfully reset.</p>
                        <p>If you did not make this change, please contact support immediately.</p>",
                    IsHtml = true
                };

                await _emailService.SendEmailAsync(message);

                return Ok(new { success = true, message = "Password has been reset successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred during password reset");
                return StatusCode(500, new { success = false, message = "An error occurred while resetting your password" });
            }
        }

        [HttpPost("reset-user-password")]
        public async Task<IActionResult> UpdatePassword([FromBody] ResetPasswordRequest request)
        {
            try
            {
                if (request == null ||
                    string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.NewPassword))
                {
                    return BadRequest(new { success = false, message = "Token, email, and new password are required" });
                }

                var user = await _userManager.FindByEmailAsync(request.Email);
                if (user == null)
                {
                    // Don't reveal that the user does not exist
                    return BadRequest(new { success = false, message = "Invalid password reset request" });
                }

              
                var token = await _userManager.GeneratePasswordResetTokenAsync(user);
                if(token == null)
                {
                    return BadRequest(new { success = false, message = "Invalid token generated while updating password" });
                }
                var result = await _userManager.ResetPasswordAsync(user, token, request.NewPassword);
                if (!result.Succeeded)
                {
                    var errorMessage = result.Errors != null && result.Errors.Any()
                        ? string.Join("; ", result.Errors.Select(e => e.Description))
                        : "Failed to reset password";
                    return BadRequest(new { success = false, message = errorMessage });
                }

                // Send confirmation email asynchronously
                _ = Task.Run(async () =>
                {
                    try
                    {
                        var message = new EmailMessage
                        {
                            To = user.Email,
                            Subject = "Your Password Has Been Updated",
                            Body = $@"
                                <h2>Password Update Notification</h2>
                                <p>Your account password has been updated by an administrator.</p>
                                <p>Your new password is: <strong>{request.NewPassword}</strong></p>
                                <p>Please login with this password and change it immediately for security purposes.</p>
                                <p style='color: #ff0000;'>Important: Delete this email after memorizing or safely storing your password.</p>
                                <br/>
                                <p>If you did not expect this change, please contact support immediately.</p>",
                            IsHtml = true
                        };

                        await _emailService.SendEmailAsync(message);
                    }
                    catch (Exception emailEx)
                    {
                        _logger.LogError(emailEx, "Failed to send password update confirmation email to {Email}", user.Email);
                    }
                });

                return Ok(new { success = true, message = "Password has been reset successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred during password reset");
                return StatusCode(500, new { success = false, message = "An error occurred while resetting your password" });
            }
        }
    }
}

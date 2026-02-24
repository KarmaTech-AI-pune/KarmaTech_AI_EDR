using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using EDR.Application.Dtos;
using EDR.Application.Services.IContract;

namespace EDR.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TwoFactorController : ControllerBase
    {
        private readonly ITwoFactorService _twoFactorService;
        private readonly IAuthService _authService;
        private readonly ILogger<TwoFactorController> _logger;

        public TwoFactorController(
            ITwoFactorService twoFactorService,
            IAuthService authService,
            ILogger<TwoFactorController> logger
           )
        {
            _twoFactorService = twoFactorService;
            _logger = logger;
            _authService = authService;
        }

        [HttpPost("send-otp")]
        public async Task<IActionResult> SendOtp([FromBody] TwoFactorLoginRequest request)
        {
            try
            {
                if (string.IsNullOrEmpty(request.Email))
                {
                    return BadRequest(new { success = false, message = "Email is required" });
                }

                var result = await _twoFactorService.SendOtpAsync(request.Email);

                if (result.Success)
                {
                    return Ok(new
                    {
                        success = true,
                        message = "OTP sent successfully. Please check your email.",
                        email = result.Email
                    });
                }

                return BadRequest(new { success = false, message = result.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending OTP to {Email}", request.Email);
                return StatusCode(500, new { success = false, message = "An error occurred while sending OTP" });
            }
        }

        [HttpPost("verify-otp")]
        public async Task<IActionResult> VerifyOtp([FromBody] TwoFactorVerifyRequest request)
        {
            try
            {
                if (string.IsNullOrEmpty(request.Email) || string.IsNullOrEmpty(request.OtpCode))
                {
                    return BadRequest(new { success = false, message = "Email and OTP code are required" });
                }

                var result = await _twoFactorService.VerifyOtpAsync(request.Email, request.OtpCode);

                if (result.Success)
                {
                    return Ok(new
                    {
                        success = true,
                        message = result.Message,
                        token = result.Token,
                        user = result.User,
                        requiresOtp = false
                    });
                }

                return BadRequest(new { success = false, message = result.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error verifying OTP for {Email}", request.Email);
                return StatusCode(500, new { success = false, message = "An error occurred while verifying OTP" });
            }
        }

        [HttpPost("enable")]
        public async Task<IActionResult> EnableTwoFactor([FromBody] string userId)
        {
            try
            {
                if (string.IsNullOrEmpty(userId))
                {
                    return BadRequest(new { success = false, message = "User ID is required" });
                }

                var result = await _twoFactorService.EnableTwoFactorAsync(userId);

                if (result)
                {
                    return Ok(new { success = true, message = "Two-factor authentication enabled successfully" });
                }

                return BadRequest(new { success = false, message = "Failed to enable two-factor authentication" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error enabling 2FA for user {UserId}", userId);
                return StatusCode(500, new { success = false, message = "An error occurred while enabling 2FA" });
            }
        }

        [HttpPost("disable")]
        public async Task<IActionResult> DisableTwoFactor([FromBody] string userId)
        {
            try
            {
                if (string.IsNullOrEmpty(userId))
                {
                    return BadRequest(new { success = false, message = "User ID is required" });
                }

                var result = await _twoFactorService.DisableTwoFactorAsync(userId);

                if (result)
                {
                    return Ok(new { success = true, message = "Two-factor authentication disabled successfully" });
                }

                return BadRequest(new { success = false, message = "Failed to disable two-factor authentication" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error disabling 2FA for user {UserId}", userId);
                return StatusCode(500, new { success = false, message = "An error occurred while disabling 2FA" });
            }
        }

        [HttpGet("status/{userId}")]
        public async Task<IActionResult> GetTwoFactorStatus(string userId)
        {
            try
            {
                if (string.IsNullOrEmpty(userId))
                {
                    return BadRequest(new { success = false, message = "User ID is required" });
                }

                var isEnabled = await _twoFactorService.IsTwoFactorEnabledAsync(userId);

                return Ok(new { success = true, userId, isTwoFactorEnabled = isEnabled });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving 2FA status for user {UserId}", userId);
                return StatusCode(500, new { success = false, message = "An error occurred while retrieving 2FA status" });
            }
        }
    }
}



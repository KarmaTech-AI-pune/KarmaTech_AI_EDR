using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;
using EDR.API.Controllers;
using EDR.Application.Dtos;
using EDR.Application.Services.IContract;

namespace EDR.API.Tests.Controllers
{
    public class TwoFactorControllerTests
    {
        private readonly Mock<ITwoFactorService> _twoFactorServiceMock;
        private readonly Mock<IAuthService> _authServiceMock;
        private readonly Mock<ILogger<TwoFactorController>> _loggerMock;
        private readonly TwoFactorController _controller;

        public TwoFactorControllerTests()
        {
            _twoFactorServiceMock = new Mock<ITwoFactorService>();
            _authServiceMock = new Mock<IAuthService>();
            _loggerMock = new Mock<ILogger<TwoFactorController>>();

            _controller = new TwoFactorController(
                _twoFactorServiceMock.Object,
                _authServiceMock.Object,
                _loggerMock.Object);
        }

        [Fact]
        public async Task SendOtp_ReturnsOk_WhenSuccessful()
        {
            _twoFactorServiceMock.Setup(s => s.SendOtpAsync("test@test.com"))
                .ReturnsAsync(new OtpSentResponse { Success = true, Message = "OTP sent", Email = "test@test.com" });

            var result = await _controller.SendOtp(new TwoFactorLoginRequest { Email = "test@test.com" });

            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.NotNull(okResult.Value);
        }

        [Fact]
        public async Task SendOtp_ReturnsBadRequest_WhenFailed()
        {
            _twoFactorServiceMock.Setup(s => s.SendOtpAsync("test@test.com"))
                .ReturnsAsync(new OtpSentResponse { Success = false, Message = "Failed to send", Email = "" });

            var result = await _controller.SendOtp(new TwoFactorLoginRequest { Email = "test@test.com" });

            Assert.IsType<BadRequestObjectResult>(result);
        }

        [Fact]
        public async Task SendOtp_ReturnsBadRequest_WhenEmailEmpty()
        {
            var result = await _controller.SendOtp(new TwoFactorLoginRequest { Email = "" });

            Assert.IsType<BadRequestObjectResult>(result);
        }

        [Fact]
        public async Task VerifyOtp_ReturnsOk_WhenSuccessful()
        {
            _twoFactorServiceMock.Setup(s => s.VerifyOtpAsync("test@test.com", "123456"))
                .ReturnsAsync(new TwoFactorResponse { Success = true, Token = "token123", Message = "Verified" });

            var result = await _controller.VerifyOtp(new TwoFactorVerifyRequest { Email = "test@test.com", OtpCode = "123456" });

            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.NotNull(okResult.Value);
        }

        [Fact]
        public async Task VerifyOtp_ReturnsBadRequest_WhenFailed()
        {
            _twoFactorServiceMock.Setup(s => s.VerifyOtpAsync("test@test.com", "123456"))
                .ReturnsAsync(new TwoFactorResponse { Success = false, Message = "Invalid OTP" });

            var result = await _controller.VerifyOtp(new TwoFactorVerifyRequest { Email = "test@test.com", OtpCode = "123456" });

            Assert.IsType<BadRequestObjectResult>(result);
        }

        [Fact]
        public async Task EnableTwoFactor_ReturnsOk_WhenSuccessful()
        {
            _twoFactorServiceMock.Setup(s => s.EnableTwoFactorAsync("user1"))
                .ReturnsAsync(true);

            var result = await _controller.EnableTwoFactor("user1");

            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.NotNull(okResult.Value);
        }

        [Fact]
        public async Task DisableTwoFactor_ReturnsOk_WhenSuccessful()
        {
            _twoFactorServiceMock.Setup(s => s.DisableTwoFactorAsync("user1"))
                .ReturnsAsync(true);

            var result = await _controller.DisableTwoFactor("user1");

            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.NotNull(okResult.Value);
        }

        [Fact]
        public async Task GetTwoFactorStatus_ReturnsOk()
        {
            _twoFactorServiceMock.Setup(s => s.IsTwoFactorEnabledAsync("user1"))
                .ReturnsAsync(true);

            var result = await _controller.GetTwoFactorStatus("user1");

            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.NotNull(okResult.Value);
        }
    }
}

using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;
using EDR.API.Controllers;
using EDR.Application.CQRS.Users.Commands;
using EDR.Application.CQRS.Users.Queries;
using EDR.Application.Dtos;
using EDR.Application.Services.IContract;
using EDR.Domain.Entities;
using EDR.Domain.Models;
using EDR.Repositories.Interfaces;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Linq;
using Microsoft.AspNetCore.Http;

namespace EDR.API.Tests.Controllers
{
    public class UserControllerTests
    {
        private readonly Mock<IMediator> _mediatorMock;
        private readonly Mock<IAuthService> _authMock;
        private readonly Mock<UserManager<User>> _userManagerMock;
        private readonly Mock<ILogger<UserController>> _loggerMock;
        private readonly Mock<ITenantService> _tenantMock;
        private readonly Mock<ITwoFactorService> _twoFactorMock;
        private readonly Mock<IEmailService> _emailMock;
        private readonly Mock<IConfiguration> _configMock;
        private readonly UserController _controller;

        public UserControllerTests()
        {
            _mediatorMock = new Mock<IMediator>();
            _authMock = new Mock<IAuthService>();
            
            var store = new Mock<IUserStore<User>>();
            _userManagerMock = new Mock<UserManager<User>>(store.Object, null, null, null, null, null, null, null, null);
            
            _loggerMock = new Mock<ILogger<UserController>>();
            _tenantMock = new Mock<ITenantService>();
            _twoFactorMock = new Mock<ITwoFactorService>();
            _emailMock = new Mock<IEmailService>();
            _configMock = new Mock<IConfiguration>();

            _controller = new UserController(
                _authMock.Object,
                _userManagerMock.Object,
                _mediatorMock.Object,
                _tenantMock.Object,
                _twoFactorMock.Object,
                _emailMock.Object,
                _configMock.Object,
                _loggerMock.Object);

            var httpContext = new Microsoft.AspNetCore.Http.DefaultHttpContext();
            _controller.ControllerContext = new ControllerContext { HttpContext = httpContext };
        }

        [Fact]
        public async Task Login_ReturnsOk_WhenValidCredentials_NoOtp()
        {
            var model = new LoginModel { Email = "test@test.com", Password = "password" };
            var user = new User { Id = "1", Email = "test@test.com" };
            
            var token = GenerateToken();
            _authMock.Setup(a => a.ValidateUserAsync(model.Email, model.Password))
                .ReturnsAsync((true, user, token));
            _twoFactorMock.Setup(t => t.IsOtpRequiredAsync(model.Email))
                .ReturnsAsync(false);
            _tenantMock.Setup(t => t.GetCurrentTenantAsync())
                .ReturnsAsync(new Tenant { Id = 1, Domain = "test.com" });

            var result = await _controller.Login(model);

            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.NotNull(okResult.Value);
        }

        [Fact]
        public async Task Login_ReturnsOk_WithOtpRequired()
        {
            var model = new LoginModel { Email = "test@test.com", Password = "password" };
            var user = new User { Id = "1", Email = "test@test.com" };
            
            var token = GenerateToken();
            _authMock.Setup(a => a.ValidateUserAsync(model.Email, model.Password))
                .ReturnsAsync((true, user, token));
            _twoFactorMock.Setup(t => t.IsOtpRequiredAsync(model.Email))
                .ReturnsAsync(true);
            _twoFactorMock.Setup(t => t.SendOtpAsync(model.Email))
                .ReturnsAsync(new OtpSentResponse { Success = true, Message = "OTP sent", Email = "test@test.com" });

            var result = await _controller.Login(model);

            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.NotNull(okResult.Value);
        }

        [Fact]
        public async Task GetAll_ReturnsOk()
        {
            _mediatorMock.Setup(m => m.Send(It.IsAny<GetAllUsersQuery>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(new List<UserDto>());

            var result = await _controller.GetAll(new GetAllUsersQuery());

            Assert.IsType<OkObjectResult>(result);
        }

        [Fact]
        public async Task GetById_ReturnsOk_WhenFound()
        {
            _mediatorMock.Setup(m => m.Send(It.IsAny<GetUserByIdQuery>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(new UserDto());

            var result = await _controller.GetById("1");

            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.NotNull(okResult.Value);
        }

        [Fact]
        public async Task GetById_ReturnsNotFound_WhenNull()
        {
            _mediatorMock.Setup(m => m.Send(It.IsAny<GetUserByIdQuery>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync((UserDto)null);

            var result = await _controller.GetById("1");

            Assert.IsType<NotFoundResult>(result);
        }

        [Fact]
        public async Task Create_ReturnsOk_WhenSuccessful()
        {
            var commands = new List<CreateUserCommand> { new CreateUserCommand { Email = "test@test.com" } };
            _mediatorMock.Setup(m => m.Send(It.IsAny<CreateUserCommand>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(new UserDto());

            var result = await _controller.Create(commands);

            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.NotNull(okResult.Value);
        }

        [Fact]
        public async Task Update_ReturnsOk_WhenValid()
        {
            var command = new UpdateUserCommand { Id = "1" };
            _mediatorMock.Setup(m => m.Send(It.IsAny<UpdateUserCommand>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(new UserDto());

            var result = await _controller.Update("1", command);

            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.NotNull(okResult.Value);
        }

        [Fact]
        public async Task Delete_ReturnsCreatedAtAction_WhenSuccessful()
        {
            _mediatorMock.Setup(m => m.Send(It.IsAny<DeleteUserCommand>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(true);

            var result = await _controller.Delete("1");

            var createdResult = Assert.IsType<CreatedAtActionResult>(result);
            Assert.Equal("GetAll", createdResult.ActionName);
        }

        [Fact]
        public async Task ForgotPassword_ReturnsOk_Always()
        {
            // Even if user not found, should return OK to prevent user enumeration
            _userManagerMock.Setup(u => u.FindByEmailAsync("test@test.com"))
                .ReturnsAsync((User)null);

            var result = await _controller.ForgotPassword(new UserController.ForgotPasswordRequest { Email = "test@test.com" });

            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.NotNull(okResult.Value);
        }

        private string GenerateToken()
        {
            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes("7bf578ef918fcccd26725d646385b72c95d29c01b38abc79caec1dbc4a36d2f5"));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, "test-user"),
                new Claim("Features", "*")
            };

            var token = new JwtSecurityToken(
                issuer: "test-issuer",
                audience: "test-audience",
                claims: claims,
                expires: DateTime.Now.AddHours(1),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}

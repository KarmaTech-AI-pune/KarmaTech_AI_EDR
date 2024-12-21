using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using NJS.Application.CQRS.Users.Commands;
using NJS.Application.CQRS.Users.Queries;
using NJS.Application.Dtos;
using NJS.Application.Services.IContract;
using NJS.Domain.Entities;

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
        public UserController(
            IAuthService authService,
            UserManager<User> userManager, IMediator mediator,
            ILogger<UserController> logger)
        {
            _authService = authService;
            _userManager = userManager;
            _logger = logger;
            _mediator = mediator;
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
                        UserName = user.UserName,
                        Email = user.Email,
                        Avatar = user.Avatar,
                        Roles = roles.ToList()
                    };

                    return Ok(new
                    {
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
        [HttpGet]     
        public async Task<IActionResult> GetAll([FromQuery] GetAllUsersQuery query)
        {
            var result = await _mediator.Send(query);
            return Ok(result);
        }

        [HttpGet("{id}")]
      //  [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetById(string id)
        {
            var query = new GetUserByIdQuery(id);
            var result = await _mediator.Send(query);
            
            if (result == null)
                return NotFound();

            return Ok(result);
        }

        [HttpPost("Create")]
        //[Authorize(Roles = "Admin")]
        public async Task<IActionResult> Create([FromBody] CreateUserCommand command)
        {
            command.Password = "Admin@123";
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _mediator.Send(command);
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
        }

        [HttpPut("{id}")]
      //  [Authorize(Roles = "Admin")]
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
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(string id)
        {
            var command = new DeleteUserCommand(id);
            var result = await _mediator.Send(command);
            
            if (!result)
                return NotFound();

            return NoContent();
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
    }
}

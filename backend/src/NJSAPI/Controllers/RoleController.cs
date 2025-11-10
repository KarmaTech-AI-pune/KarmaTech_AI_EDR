using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NJS.Application.CQRS.Roles.Commands;
using NJS.Application.CQRS.Users.Commands;
using NJS.Application.CQRS.Users.Queries;
using NJS.Application.Dtos;

namespace NJSAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class RoleController : ControllerBase
    {
        private readonly IMediator _mediator;

        public RoleController(IMediator mediator)
        {
            _mediator = mediator ?? throw new ArgumentNullException(nameof(mediator));
        }

        [HttpGet]
        public async Task<IActionResult> GetRoles()
        {
            var query = new GetAllRolesQuery();
            var roles = await _mediator.Send(query);
            return Ok(roles);
        }

        [HttpGet("getRolesWithPermissions")]
        public async Task<IActionResult> GetRolesWithPermissions()
        {
            var query = new GetAllRolesWithPermissionsQuery();
            var roles = await _mediator.Send(query);
            return Ok(roles);
        }

        [HttpGet("getPermissionsByGroupedByCategory")]
        public async Task<IActionResult> GetPermissionsByGroupedByCategory()
        {
            var query = new GetPermissionsByGroupedByCategoryQuery();
            var roles = await _mediator.Send(query);
            return Ok(roles);
        }

        [HttpGet]
        [Route("{roleId}")]
        public async Task<ActionResult<IEnumerable<PermissionDto>>> GetRolePermissions(string roleId)
        {
            try
            {
                var permissions = await _mediator.Send(new GetAllPermissionsQuery());
                return Ok(permissions);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpPost]
        public async Task<IActionResult> CreateRole([FromBody] List<RoleDefination> roles)
        {
            var createdCount = 0;
            foreach (var role in roles)
            {
                try
                {
                    var command = new CreateRoleCommands(role);
                    var result = await _mediator.Send(command);

                    if (result)
                    {
                        createdCount++;
                    }
                }
                catch (InvalidOperationException ex)
                {
                    // Log the error for individual role creation but continue processing others
                    Console.WriteLine($"Error creating role: {ex.Message}");
                }
                catch (Exception ex)
                {
                    // Log the error for individual role creation but continue processing others
                    Console.WriteLine($"Error creating role: {ex.Message}");
                }
            }

            if (createdCount > 0)
            {
                return Ok(new { CreatedCount = createdCount, message = $"{createdCount} roles created successfully." });
            }
            else
            {
                return BadRequest(new { message = "No roles were created." });
            }
        }

        [HttpPut]
        [Route("{roleId}")]
        public async Task<IActionResult> UpdateRolePermissions(string roleId, [FromBody] RoleDefination role)
        {
            try
            {
                if (string.IsNullOrEmpty(roleId))
                {
                    return BadRequest(new { message = "Role ID is required" });
                }
                if (role.Permissions == null || role.Permissions.Count == 0)
                {
                    return BadRequest(new { message = "At least one permission must be specified" });
                }
                var command = new UpdateRolePermissionsCommand(roleId, role);
                await _mediator.Send(command);
                return Ok(new { message = "Role permissions updated successfully" });
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpGet]
        [Route("GetRoleByName/{roleName}")]
        public async Task<ActionResult<RoleDto>> GetRoleByName(string roleName)
        {
            if (string.IsNullOrEmpty(roleName))
            {
                throw new ArgumentException($"'{nameof(roleName)}' cannot be null or empty.", nameof(roleName));
            }

            try
            {
                var role = await _mediator.Send(new GetRoleByNameQuery(roleName.ToLowerInvariant()));
                return Ok(role);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpDelete]
        [Route("{roleId}")]
        public async Task<IActionResult> Delete(string roleId)
        {
            if (string.IsNullOrWhiteSpace(roleId))
            {
                return BadRequest(new { message = "Invalid role ID" });
            }

            try
            {
                // Explicitly create the command with the role ID
                DeleteRoleCommand deleteCommand = new DeleteRoleCommand(roleId);

                // Explicitly declare the task and await its result
                Task<bool> deleteTask = _mediator.Send(deleteCommand);
                bool deleteResult = await deleteTask;
               
                // Check the result and return appropriate response
                if (deleteResult)
                {
                    return Ok(new { message = "Role deleted successfully" });
                }
                
                return BadRequest(new { message = "Failed to delete role" });
            }
            catch (Exception ex)
            {
                // Log the exception details (consider using a logging framework)
                return StatusCode(500, new { message = "An error occurred while deleting the role", details = ex.Message });
            }
        }
    }
}

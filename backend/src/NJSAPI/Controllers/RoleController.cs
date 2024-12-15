using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NJS.Application.CQRS.Users.Commands;
using NJS.Application.CQRS.Users.Queries;
using NJS.Application.Dtos;

namespace NJSAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
   
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

        [HttpPut]
        [Route("{roleId}/permissions")]
       
        public async Task<IActionResult> UpdateRolePermissions(string roleId, [FromBody] List<int> permissionIds)
        {
            try
            {
                if (string.IsNullOrEmpty(roleId))
                {
                    return BadRequest(new { message = "Role ID is required" });
                }

                if (permissionIds == null || permissionIds.Count == 0)
                {
                    return BadRequest(new { message = "At least one permission must be specified" });
                }

                var command = new UpdateRolePermissionsCommand(roleId, permissionIds);
                var result = await _mediator.Send(command);

                if (result)
                {
                    return Ok(new { message = "Role permissions updated successfully" });
                }

                return BadRequest(new { message = "Failed to update role permissions" });
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
    }
}

using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using NJS.Application.CQRS.Permissions.Commands;
using NJS.Application.CQRS.Permissions.Queries;
using NJS.Application.Dtos;
using NJS.Domain.Entities; // Assuming Permission entity is here
using NJS.Repositories.Interfaces; // For IPermissionRepository
using NJS.Application.Services.IContract; // For ITenantService, ICurrentUserService
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;

namespace NJSAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class PermissionsController : BaseController
    {
        private readonly IMediator _mediator;
        private readonly ILogger<PermissionsController> _logger;

        public PermissionsController(
            IMediator mediator,
            ILogger<PermissionsController> logger,
            ITenantService tenantService,
            ICurrentUserService currentUserService)
            : base(tenantService, currentUserService)
        {
            _mediator = mediator ?? throw new ArgumentNullException(nameof(mediator));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        /// <summary>
        /// Creates a new permission
        /// </summary>
        [HttpPost]
        [ProducesResponseType(typeof(int), 201)]
        [ProducesResponseType(400)]
        [ProducesResponseType(500)]
        public async Task<IActionResult> Create([FromBody] PermissionDto permissionData)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                // Tenant access check is handled in BaseController's EnsureTenantAccessAsync if needed
                // For simplicity, assuming tenant context is available or not strictly required for permission creation itself

                var command = new CreatePermissionCommand(permissionData);
                var permissionId = await _mediator.Send(command);
                return CreatedAtAction(nameof(GetById), new { id = permissionId }, permissionId);
            }
            catch (ArgumentException ex) // For specific validation errors like duplicate name
            {
                _logger.LogWarning($"Validation error creating permission: {ex.Message}");
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating permission.");
                return StatusCode(500, new { message = ex.Message });
            }
        }

        /// <summary>
        /// Gets a permission by ID
        /// </summary>
        [HttpGet("{id}")]
        [ProducesResponseType(typeof(PermissionDto), 200)]
        [ProducesResponseType(404)]
        [ProducesResponseType(500)]
        public async Task<IActionResult> GetById(int id)
        {
            if (id <= 0)
            {
                _logger.LogWarning($"GetById request received invalid ID: {id}");
                return BadRequest("Invalid permission ID.");
            }

            try
            {
                var query = new GetPermissionByIdQuery { Id = id };
                var result = await _mediator.Send(query);

                if (result == null)
                    return NotFound($"Permission with ID {id} not found.");

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting permission by ID {PermissionId}.", id);
                return StatusCode(500, new { message = ex.Message });
            }
        }

        /// <summary>
        /// Gets all permissions
        /// </summary>
        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<PermissionDto>), 200)]
        [ProducesResponseType(500)]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var query = new GetAllPermissionsQuery();
                var result = await _mediator.Send(query);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all permissions.");
                return StatusCode(500, new { message = ex.Message });
            }
        }

        /// <summary>
        /// Updates an existing permission
        /// </summary>
        [HttpPut("{id}")]
        [ProducesResponseType(204)] // Typically 204 for successful update with no content returned
        [ProducesResponseType(400)]
        [ProducesResponseType(404)]
        [ProducesResponseType(500)]
        public async Task<IActionResult> Update(int id, [FromBody] PermissionDto permissionData)
        {
            if (!ModelState.IsValid)
            {
                _logger.LogWarning($"Invalid model state for update permission ID {id}.");
                return BadRequest(ModelState);
            }

            if (id != permissionData.Id)
            {
                _logger.LogWarning($"ID mismatch: URL ID {id} != DTO ID {permissionData.Id}");
                return BadRequest("ID mismatch between URL and request body.");
            }

            try
            {
                var command = new UpdatePermissionCommand(permissionData);
                var success = await _mediator.Send(command);

                if (!success) // Handler might return false if permission not found, though it throws exception now
                {
                    // This path might be less likely if exceptions are thrown for not found
                    return NotFound($"Permission with ID {id} not found.");
                }

                // Return the updated project data (optional, 204 No Content is also common)
                var updatedPermission = await _mediator.Send(new GetPermissionByIdQuery { Id = id });
                return Ok(updatedPermission);
            }
            catch (ArgumentException ex) // For specific validation errors like not found or duplicate name
            {
                _logger.LogWarning($"Validation error updating permission ID {id}: {ex.Message}");
                return BadRequest(new { message = ex.Message }); // Or NotFound if it's specifically a not found error
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating permission with ID {PermissionId}.", id);
                return StatusCode(500, new { message = ex.Message });
            }
        }

        /// <summary>
        /// Deletes a permission
        /// </summary>
        [HttpDelete("{id}")]
        [ProducesResponseType(typeof(object), 200)] // Returning object for success message
        [ProducesResponseType(500)]
        public async Task<IActionResult> Delete(int id)
        {
            if (id <= 0)
            {
                _logger.LogWarning($"Delete request received invalid ID: {id}");
                return BadRequest("Invalid permission ID.");
            }

            try
            {
                var command = new DeletePermissionCommand(id);
                await _mediator.Send(command);
                return Ok(new { success = true, message = $"Permission with ID {id} deleted successfully." });
            }
            catch (ArgumentException ex) // For specific validation errors like not found
            {
                _logger.LogWarning($"Validation error deleting permission ID {id}: {ex.Message}");
                // If the handler returns true for not found, we still return success.
                // If it throws an exception, this catch block handles it.
                return Ok(new { success = true, message = $"Permission with ID {id} deleted successfully." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting permission with ID {PermissionId}.", id);
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }
    }
}

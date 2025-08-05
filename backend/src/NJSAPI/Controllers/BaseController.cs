using Microsoft.AspNetCore.Mvc;
using NJS.Application.Services;
using NJS.Application.Services.IContract;
using NJS.Repositories.Interfaces;
using System.Security.Claims;

namespace NJSAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public abstract class BaseController : ControllerBase
    {
        protected readonly ITenantService _tenantService;
        protected readonly ICurrentUserService _currentUserService;

        protected BaseController(ITenantService tenantService, ICurrentUserService currentUserService)
        {
            _tenantService = tenantService;
            _currentUserService = currentUserService;
        }

        /// <summary>
        /// Gets the current tenant ID from JWT claims or context
        /// </summary>
        protected int? CurrentTenantId => _tenantService.GetTenantIdFromClaims();

        /// <summary>
        /// Gets the current tenant domain from JWT claims or context
        /// </summary>
        protected string CurrentTenantDomain => _tenantService.GetTenantDomainFromClaims();

        /// <summary>
        /// Gets the current user type (SuperAdmin or TenantUser)
        /// </summary>
        protected string CurrentUserType => _tenantService.GetUserTypeFromClaims();

        /// <summary>
        /// Gets the current tenant role for the user
        /// </summary>
        protected string CurrentTenantRole => _tenantService.GetTenantRoleFromClaims();

        /// <summary>
        /// Checks if the current user is a super admin
        /// </summary>
        protected bool IsSuperAdmin => _tenantService.IsSuperAdminFromClaims();

        /// <summary>
        /// Gets the current user ID
        /// </summary>
        protected string CurrentUserId => _currentUserService.UserId;

        /// <summary>
        /// Gets the current user name
        /// </summary>
        protected string CurrentUserName => _currentUserService.UserName;

        /// <summary>
        /// Validates if the current user has access to the specified tenant
        /// </summary>
        /// <param name="tenantId">The tenant ID to validate access for</param>
        /// <returns>True if user has access, false otherwise</returns>
        protected async Task<bool> ValidateTenantAccessAsync(int tenantId)
        {
            if (!_currentUserService.IsAuthenticated)
                return false;

            return await _tenantService.ValidateTenantAccessAsync(CurrentUserId, tenantId);
        }

        /// <summary>
        /// Ensures the current user has access to the specified tenant
        /// </summary>
        /// <param name="tenantId">The tenant ID to validate access for</param>
        /// <returns>BadRequest if access is denied</returns>
        protected async Task<IActionResult> EnsureTenantAccessAsync(int tenantId)
        {
            if (!await ValidateTenantAccessAsync(tenantId))
            {
                return BadRequest(new { message = "Access denied to this tenant" });
            }

            return null; // Continue with the request
        }

        /// <summary>
        /// Ensures the current user is a super admin
        /// </summary>
        /// <returns>BadRequest if user is not a super admin</returns>
        protected IActionResult EnsureSuperAdmin()
        {
            if (!IsSuperAdmin)
            {
                return BadRequest(new { message = "Super admin access required" });
            }

            return null; // Continue with the request
        }

        /// <summary>
        /// Ensures the current user has the specified tenant role
        /// </summary>
        /// <param name="requiredRole">The required tenant role</param>
        /// <returns>BadRequest if user doesn't have the required role</returns>
        protected IActionResult EnsureTenantRole(string requiredRole)
        {
            if (IsSuperAdmin)
                return null; // Super admin can do anything

            if (CurrentTenantRole != requiredRole)
            {
                return BadRequest(new { message = $"Tenant role '{requiredRole}' required" });
            }

            return null; // Continue with the request
        }

        /// <summary>
        /// Gets the current tenant information
        /// </summary>
        /// <returns>The current tenant or null if not found</returns>
        protected async Task<NJS.Domain.Entities.Tenant> GetCurrentTenantAsync()
        {
            return await _tenantService.GetCurrentTenantAsync();
        }

        /// <summary>
        /// Creates a standardized error response
        /// </summary>
        /// <param name="message">Error message</param>
        /// <param name="statusCode">HTTP status code</param>
        /// <returns>Standardized error response</returns>
        protected IActionResult ErrorResponse(string message, int statusCode = 400)
        {
            return StatusCode(statusCode, new { success = false, message });
        }

        /// <summary>
        /// Creates a standardized success response
        /// </summary>
        /// <param name="data">Response data</param>
        /// <param name="message">Success message</param>
        /// <returns>Standardized success response</returns>
        protected IActionResult SuccessResponse(object data, string message = "Success")
        {
            return Ok(new { success = true, message, data });
        }
    }
} 
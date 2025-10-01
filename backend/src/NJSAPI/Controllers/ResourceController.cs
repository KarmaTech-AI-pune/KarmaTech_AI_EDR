using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using NJS.Domain.Entities;

namespace NJSAPI.Controllers
{
    [ApiController]
    [Route("api/resources")]
    [Authorize]
    public class ResourceController : ControllerBase
    {
        private readonly UserManager<User> _userManager;
        private readonly RoleManager<Role> _roleManager;

        public ResourceController(
            UserManager<User> userManager,
            RoleManager<Role> roleManager)
        {
            _userManager = userManager;
            _roleManager = roleManager;
        }

        /// <summary>
        /// Get all resource roles
        /// </summary>
        /// <returns>List of resource roles</returns>
        [HttpGet("roles")]
        public async Task<IActionResult> GetResourceRoles()
        {
            var resourceRoles = await _roleManager.Roles
                .Where(r => r.IsResourceRole == true)
                .Select(r => new
                {
                    id = r.Id,
                    name = r.Name,
                    description = r.Description,
                    min_rate = r.MinRate
                })
                .ToListAsync();

            return Ok(resourceRoles);
        }

        /// <summary>
        /// Get all employees that can be assigned to tasks
        /// </summary>
        /// <returns>List of employees</returns>
        [HttpGet("employees")]
        public async Task<IActionResult> GetEmployees()
        {
            var activeUsers = await _userManager.Users
                .Where(u => u.IsActive)
                .ToListAsync();

            var employees = new List<object>();

            foreach (var user in activeUsers)
            {
                var roles = await _userManager.GetRolesAsync(user);
                var roleId = string.Empty;
                
                if (roles.Any())
                {
                    var role = await _roleManager.FindByNameAsync(roles.First());
                    roleId = role?.Id ?? string.Empty;
                }

                employees.Add(new
                {
                    id = user.Id,
                    name = user.Name,
                    email = user.Email,
                    role_id = roleId,
                    standard_rate = user.StandardRate,
                    is_consultant = user.IsConsultant,
                    is_active = user.IsActive
                });
            }

            return Ok(employees);
        }

        /// <summary>
        /// Get employee by ID
        /// </summary>
        /// <param name="id">Employee ID</param>
        /// <returns>Employee details</returns>
        [HttpGet("employees/{id}")]
        public async Task<IActionResult> GetEmployeeById(string id)
        {
            var user = await _userManager.FindByIdAsync(id);

            if (user == null || !user.IsActive)
            {
                return NotFound();
            }

            var roles = await _userManager.GetRolesAsync(user);
            var roleId = string.Empty;
            
            if (roles.Any())
            {
                var role = await _roleManager.FindByNameAsync(roles.First());
                roleId = role?.Id ?? string.Empty;
            }

            var employee = new
            {
                id = user.Id,
                name = user.Name,
                email = user.Email,
                role_id = roleId,
                standard_rate = user.StandardRate,
                is_consultant = user.IsConsultant,
                is_active = user.IsActive
            };

            return Ok(employee);
        }

        /// <summary>
        /// Get project resources
        /// </summary>
        /// <param name="projectId">Project ID</param>
        /// <returns>List of project resources</returns>
        [HttpGet("projects/{projectId}")]
        public async Task<IActionResult> GetProjectResources(int projectId)
        {
            var users = await _userManager.Users
                .Where(u => u.ProjectResources.Any(pr => pr.ProjectId == projectId))
                .ToListAsync();

            var projectResources = new List<object>();

            foreach (var user in users)
            {
                var roles = await _userManager.GetRolesAsync(user);
                var roleId = string.Empty;
                
                if (roles.Any())
                {
                    var role = await _roleManager.FindByNameAsync(roles.First());
                    roleId = role?.Id ?? string.Empty;
                }

                var projectRate = user.ProjectResources
                    .Where(pr => pr.ProjectId == projectId)
                    .Select(pr => pr.ProjectRate)
                    .FirstOrDefault();

                projectResources.Add(new
                {
                    id = user.Id,
                    name = user.Name,
                    email = user.Email,
                    role_id = roleId,
                    standard_rate = user.StandardRate,
                    is_consultant = user.IsConsultant,
                    is_active = user.IsActive,
                    project_rate = projectRate
                });
            }

            return Ok(projectResources);
        }
    }
}

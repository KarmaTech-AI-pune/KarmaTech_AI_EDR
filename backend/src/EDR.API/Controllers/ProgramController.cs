using System;
using System.Linq;
using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Logging;
using EDR.Application.CQRS.Programs.Commands;
using EDR.Application.CQRS.Programs.Queries;
using EDR.Application.DTOs;
using EDR.Application.Services;
using EDR.Application.Services.IContract;
using EDR.Domain.Database;
using EDR.Repositories.Interfaces;

namespace EDR.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ProgramController : BaseController
    {
        private readonly IMediator _mediator;
        private readonly ILogger<ProgramController> _logger;
        private readonly ProjectManagementContext _context;

        public ProgramController(
            IMediator mediator,
            ITenantService tenantService,
            ICurrentUserService currentUserService,
            ILogger<ProgramController> logger,
            ProjectManagementContext context)
            : base(tenantService, currentUserService)
        {
            _mediator = mediator ?? throw new ArgumentNullException(nameof(mediator));
            _logger = logger;
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }

        /// <summary>
        /// Creates a new program
        /// </summary>
        [HttpPost]
        [ProducesResponseType(typeof(int), 201)]
        [ProducesResponseType(400)]
        [ProducesResponseType(500)]
        public async Task<IActionResult> Create([FromBody] ProgramDto programData)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                // Ensure user has access to current tenant
                if (CurrentTenantId.HasValue)
                {
                    var accessCheck = await EnsureTenantAccessAsync(CurrentTenantId.Value);
                    if (accessCheck != null) return accessCheck;
                }

                // Set the tenant ID in the program data
                programData.TenantId = CurrentTenantId ?? 0;

                var command = new CreateProgramCommand
                {
                    TenantId = programData.TenantId,
                    Name = programData.Name,
                    Description = programData.Description,
                    StartDate = programData.StartDate,
                    EndDate = programData.EndDate,
                    CreatedBy = programData.CreatedBy ?? CurrentUserName
                };

                var programId = await _mediator.Send(command);
                return CreatedAtAction(nameof(GetById), new { id = programId }, programId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating program for tenant {TenantId}", CurrentTenantId);
                return StatusCode(500, new { message = ex.Message });
            }
        }

        /// <summary>
        /// Gets a program by ID
        /// </summary>
        [HttpGet("{id}")]
        [ProducesResponseType(typeof(ProgramDto), 200)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                // Ensure user has access to current tenant
                if (CurrentTenantId.HasValue)
                {
                    var accessCheck = await EnsureTenantAccessAsync(CurrentTenantId.Value);
                    if (accessCheck != null) return accessCheck;
                }

                var query = new GetProgramByIdQuery { Id = id };
                var result = await _mediator.Send(query);

                if (result == null)
                    return NotFound();

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting program {ProgramId} for tenant {TenantId}", id, CurrentTenantId);
                return StatusCode(500, new { message = ex.Message });
            }
        }

        /// <summary>
        /// Gets all programs
        /// </summary>
        [HttpGet]
        [ProducesResponseType(typeof(ProgramDto[]), 200)]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                // Ensure user has access to current tenant
                if (CurrentTenantId.HasValue)
                {
                    var accessCheck = await EnsureTenantAccessAsync(CurrentTenantId.Value);
                    if (accessCheck != null) return accessCheck;
                }

                var query = new GetAllProgramsQuery();
                var result = await _mediator.Send(query);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting programs for tenant {TenantId}", CurrentTenantId);
                return StatusCode(500, new { message = ex.Message });
            }
        }

        /// <summary>
        /// Updates an existing program
        /// </summary>
        [HttpPut("{id}")]
        [ProducesResponseType(204)]
        [ProducesResponseType(400)]
        [ProducesResponseType(404)]
        [ProducesResponseType(500)]
        public async Task<IActionResult> Update(int id, [FromBody] ProgramDto programData)
        {
            if (id != programData.Id)
            {
                _logger.LogWarning($"ID mismatch: URL ID {id} != DTO ID {programData.Id}");
                return BadRequest("ID mismatch");
            }

            if (!ModelState.IsValid)
            {
                _logger.LogWarning($"Invalid model state: {string.Join(", ", ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage))}");
                return BadRequest(ModelState);
            }

            try
            {
                var command = new UpdateProgramCommand
                {
                    Id = id,
                    Name = programData.Name,
                    Description = programData.Description,
                    StartDate = programData.StartDate,
                    EndDate = programData.EndDate,
                    LastModifiedBy = CurrentUserName
                };

                await _mediator.Send(command);

                // Return the updated program data
                var updatedProgram = await _mediator.Send(new GetProgramByIdQuery { Id = id });
                return Ok(updatedProgram);
            }
            catch (ArgumentException ex) // Program not found
            {
                _logger.LogError(ex, $"Program not found error: {ex.Message}");
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error updating program: {ex.Message}");
                return StatusCode(500, new { message = ex.Message });
            }
        }

        /// <summary>
        /// Deletes a program
        /// </summary>
        [HttpDelete("{id}")]
        [ProducesResponseType(typeof(object), 200)]
        [ProducesResponseType(500)]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                try
                {
                    await _mediator.Send(new DeleteProgramCommand { Id = id });
                    // Log success
                    return Ok(new { success = true, message = $"Program with ID {id} deleted successfully" });
                }
                catch (ArgumentException ex) // Program not found
                {
                    _logger.LogError(ex, $"Program not found, but returning success: {ex.Message}");
                    // Return success even if program doesn't exist
                    return Ok(new { success = true, message = $"Program with ID {id} deleted successfully" });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error deleting program: {ex.Message}");
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }
    }
}


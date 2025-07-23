using MediatR;
using Microsoft.AspNetCore.Mvc;
using NJS.Application.CQRS.Tenants.Commands;
using NJS.Application.CQRS.Tenants.Queries;
using NJS.Application.Dtos;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace NJSAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TenantsController : ControllerBase
    {
        private readonly IMediator _mediator;

        public TenantsController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<TenantDto>>> GetAll()
        {
            var tenants = await _mediator.Send(new GetAllTenantsQuery());
            return Ok(tenants);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<TenantDto>> GetById(int id)
        {
            var tenant = await _mediator.Send(new GetTenantByIdQuery { Id = id });
            if (tenant == null)
            {
                return NotFound();
            }
            return Ok(tenant);
        }

        [HttpPost]
        public async Task<ActionResult<TenantDto>> Create(CreateTenantCommand command)
        {
            var tenant = await _mediator.Send(command);
            return CreatedAtAction(nameof(GetById), new { id = tenant.Id }, tenant);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, UpdateTenantCommand command)
        {
            if (id != command.Id)
            {
                return BadRequest();
            }

            var tenant = await _mediator.Send(command);

            if (tenant == null)
            {
                return NotFound();
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            await _mediator.Send(new DeleteTenantCommand { Id = id });
            return NoContent();
        }
    }
}

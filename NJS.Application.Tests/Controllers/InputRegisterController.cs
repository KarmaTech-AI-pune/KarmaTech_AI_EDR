using MediatR;
using Microsoft.AspNetCore.Mvc;
using NJS.Application.Tests.CQRS.InputRegister.Commands;
using NJS.Application.Tests.CQRS.InputRegister.Queries;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace NJS.Application.Tests.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class InputRegisterController : ControllerBase
    {
        private readonly IMediator _mediator;

        public InputRegisterController(IMediator mediator)
        {
            _mediator = mediator ?? throw new ArgumentNullException(nameof(mediator));
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var query = new GetAllInputRegistersQuery();
                var result = await _mediator.Send(query);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest($"Error retrieving input registers: {ex.Message}");
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                var query = new GetInputRegisterByIdQuery(id);
                var result = await _mediator.Send(query);
                
                if (result == null)
                    return NotFound($"Input register with ID {id} not found");
                
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest($"Error retrieving input register: {ex.Message}");
            }
        }

        [HttpGet("project/{projectId}")]
        public async Task<IActionResult> GetByProject(int projectId)
        {
            try
            {
                var query = new GetInputRegistersByProjectQuery(projectId);
                var result = await _mediator.Send(query);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest($"Error retrieving input registers for project: {ex.Message}");
            }
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateInputRegisterCommand command)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var result = await _mediator.Send(command);
                return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
            }
            catch (Exception ex)
            {
                return BadRequest($"Error creating input register: {ex.Message}");
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateInputRegisterCommand command)
        {
            try
            {
                if (id != command.Id)
                    return BadRequest("ID mismatch between route and body");

                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var result = await _mediator.Send(command);
                return Ok(result);
            }
            catch (Exception ex)
            {
                if (ex.Message.Contains("not found"))
                    return NotFound(ex.Message);
                
                return BadRequest($"Error updating input register: {ex.Message}");
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var command = new DeleteInputRegisterCommand(id);
                var result = await _mediator.Send(command);
                
                if (!result)
                    return NotFound($"Input register with ID {id} not found");
                
                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest($"Error deleting input register: {ex.Message}");
            }
        }
    }
}

using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using EDR.Application.CQRS.InputRegister.Commands;
using EDR.Application.CQRS.InputRegister.Queries;
using EDR.Application.DTOs;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace EDR.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class InputRegisterController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly ILogger<InputRegisterController> _logger;

        public InputRegisterController(IMediator mediator, ILogger<InputRegisterController> logger)
        {
            _mediator = mediator ?? throw new ArgumentNullException(nameof(mediator));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<InputRegisterDto>>> GetAll()
        {
            try
            {
                var query = new GetAllInputRegistersQuery();
                var result = await _mediator.Send(query);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all input registers");
                return StatusCode(500, new { message = "An error occurred while retrieving input registers" });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<InputRegisterDto>> GetById(int id)
        {
            try
            {
                var query = new GetInputRegisterByIdQuery(id);
                var result = await _mediator.Send(query);

                if (result == null)
                    return NotFound(new { message = $"Input register with ID {id} not found" });

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting input register by id {Id}", id);
                return StatusCode(500, new { message = "An error occurred while retrieving the input register" });
            }
        }

        [HttpGet("project/{projectId}")]
        public async Task<ActionResult<IEnumerable<InputRegisterDto>>> GetByProject(int projectId)
        {
            try
            {
                var query = new GetInputRegistersByProjectQuery(projectId);
                var result = await _mediator.Send(query);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting input registers for project {ProjectId}", projectId);
                return StatusCode(500, new { message = "An error occurred while retrieving input registers for the project" });
            }
        }

        [HttpPost]
        public async Task<ActionResult<InputRegisterDto>> Create([FromBody] CreateInputRegisterCommand command)
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
                _logger.LogError(ex, "Error creating input register");
                return StatusCode(500, new { message = "An error occurred while creating the input register" });
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<InputRegisterDto>> Update(int id, [FromBody] UpdateInputRegisterCommand command)
        {
            try
            {
                if (id != command.Id)
                    return BadRequest(new { message = "ID mismatch" });

                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var result = await _mediator.Send(command);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating input register {Id}", id);
                return StatusCode(500, new { message = "An error occurred while updating the input register" });
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(int id)
        {
            try
            {
                var command = new DeleteInputRegisterCommand(id);
                var result = await _mediator.Send(command);

                if (!result)
                    return NotFound(new { message = $"Input register with ID {id} not found" });

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting input register {Id}", id);
                return StatusCode(500, new { message = "An error occurred while deleting the input register" });
            }
        }
    }
}


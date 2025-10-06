using MediatR;
using Microsoft.AspNetCore.Mvc;
using NJS.Application.CQRS.MeasurementUnit.Commands;
using NJS.Application.CQRS.MeasurementUnit.Queries;
using NJS.Application.DTOs;
using NJS.Domain.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace NJSAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MeasurementUnitsController : ControllerBase
    {
        private readonly IMediator _mediator;

        public MeasurementUnitsController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<MeasurementUnitDto>>> GetAll([FromQuery] FormType formType)
        {
            var query = new GetAllMeasurementUnitsQuery { FormType = formType };
            var measurementUnits = await _mediator.Send(query);
            return Ok(measurementUnits);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<MeasurementUnitDto>> GetById(int id, [FromQuery] FormType formType)
        {
            var query = new GetMeasurementUnitByIdQuery { Id = id, FormType = formType };
            var measurementUnit = await _mediator.Send(query);

            if (measurementUnit == null)
            {
                return NotFound();
            }

            return Ok(measurementUnit);
        }

        [HttpPost]
        public async Task<ActionResult<MeasurementUnitDto>> Create(CreateMeasurementUnitCommand command)
        {
            var measurementUnit = await _mediator.Send(command);
            return CreatedAtAction(nameof(GetById), new { id = measurementUnit.Id, FormType = (int)command.FormType }, measurementUnit);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<MeasurementUnitDto>> Update([FromRoute] int id, [FromQuery] FormType formType, UpdateMeasurementUnitCommand command)
        {
            if (id != command.Id)
            {
                return BadRequest();
            }

            command.FormType = formType;

            var updatedMeasurementUnit = await _mediator.Send(command);

            if (updatedMeasurementUnit == null)
            {
                return NotFound();
            }

            return Ok(updatedMeasurementUnit);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id, [FromQuery] FormType formType)
        {
            await _mediator.Send(new DeleteMeasurementUnitCommand { Id = id, FormType = formType });
            return NoContent();
        }
    }
}

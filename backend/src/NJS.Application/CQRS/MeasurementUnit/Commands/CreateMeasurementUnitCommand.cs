using MediatR;
using NJS.Application.DTOs;

namespace NJS.Application.CQRS.MeasurementUnit.Commands
{
using NJS.Domain.Entities;

    public class CreateMeasurementUnitCommand : IRequest<MeasurementUnitDto>
    {
        public string? Name { get; set; }
        public FormType FormType { get; set; }
    }
}

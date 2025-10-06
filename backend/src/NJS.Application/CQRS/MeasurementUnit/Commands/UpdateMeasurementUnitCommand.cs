using MediatR;
using NJS.Application.DTOs;

namespace NJS.Application.CQRS.MeasurementUnit.Commands
{
using NJS.Domain.Entities;

    public class UpdateMeasurementUnitCommand : IRequest<MeasurementUnitDto>
    {
        public int Id { get; set; }
        public string? Name { get; set; }
        public FormType FormType { get; set; }
    }
}

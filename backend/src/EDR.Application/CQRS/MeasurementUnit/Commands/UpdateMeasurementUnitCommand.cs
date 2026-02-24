using MediatR;
using EDR.Application.DTOs;

namespace EDR.Application.CQRS.MeasurementUnit.Commands
{
using EDR.Domain.Entities;

    public class UpdateMeasurementUnitCommand : IRequest<MeasurementUnitDto>
    {
        public int Id { get; set; }
        public string? Name { get; set; }
        public FormType FormType { get; set; }
    }
}


using MediatR;

namespace EDR.Application.CQRS.MeasurementUnit.Commands
{
using EDR.Domain.Entities;

    public class DeleteMeasurementUnitCommand : IRequest
    {
        public int Id { get; set; }
        public FormType FormType { get; set; }
    }
}


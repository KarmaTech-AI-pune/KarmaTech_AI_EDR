using MediatR;

namespace NJS.Application.CQRS.MeasurementUnit.Commands
{
using NJS.Domain.Entities;

    public class DeleteMeasurementUnitCommand : IRequest
    {
        public int Id { get; set; }
        public FormType FormType { get; set; }
    }
}

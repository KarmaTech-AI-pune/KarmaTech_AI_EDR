using MediatR;
using NJS.Application.DTOs;

namespace NJS.Application.CQRS.MeasurementUnit.Queries
{
using NJS.Domain.Entities;

    public class GetMeasurementUnitByIdQuery : IRequest<MeasurementUnitDto>
    {
        public int Id { get; set; }
        public FormType FormType { get; set; }
    }
}

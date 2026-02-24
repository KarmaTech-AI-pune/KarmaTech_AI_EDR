using MediatR;
using EDR.Application.DTOs;

namespace EDR.Application.CQRS.MeasurementUnit.Queries
{
using EDR.Domain.Entities;

    public class GetMeasurementUnitByIdQuery : IRequest<MeasurementUnitDto>
    {
        public int Id { get; set; }
        public FormType FormType { get; set; }
    }
}


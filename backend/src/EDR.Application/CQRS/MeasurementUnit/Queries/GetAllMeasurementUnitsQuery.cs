using MediatR;
using EDR.Application.DTOs;
using System.Collections.Generic;

namespace EDR.Application.CQRS.MeasurementUnit.Queries
{
using EDR.Domain.Entities;

    public class GetAllMeasurementUnitsQuery : IRequest<IEnumerable<MeasurementUnitDto>>
    {
        public FormType FormType { get; set; }
    }
}


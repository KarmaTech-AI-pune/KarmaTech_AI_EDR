using MediatR;
using NJS.Application.DTOs;
using System.Collections.Generic;

namespace NJS.Application.CQRS.MeasurementUnit.Queries
{
using NJS.Domain.Entities;

    public class GetAllMeasurementUnitsQuery : IRequest<IEnumerable<MeasurementUnitDto>>
    {
        public FormType FormType { get; set; }
    }
}

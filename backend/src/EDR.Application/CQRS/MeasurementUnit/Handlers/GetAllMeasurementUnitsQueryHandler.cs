using MediatR;
using EDR.Application.CQRS.MeasurementUnit.Queries;
using EDR.Application.DTOs;
using EDR.Repositories.Interfaces;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace EDR.Application.CQRS.MeasurementUnit.Handlers
{
    public class GetAllMeasurementUnitsQueryHandler : IRequestHandler<GetAllMeasurementUnitsQuery, IEnumerable<MeasurementUnitDto>>
    {
        private readonly IMeasurementUnitRepository _measurementUnitRepository;

        public GetAllMeasurementUnitsQueryHandler(IMeasurementUnitRepository measurementUnitRepository)
        {
            _measurementUnitRepository = measurementUnitRepository;
        }

        public async Task<IEnumerable<MeasurementUnitDto>> Handle(GetAllMeasurementUnitsQuery request, CancellationToken cancellationToken)
        {
            var measurementUnits = await _measurementUnitRepository.GetAllAsync(request.FormType);

            return measurementUnits.Select(mu => new MeasurementUnitDto
            {
                Id = mu.Id,
                Name = mu.Name,
                FormType = mu.FormType
            }).ToList();
        }
    }
}


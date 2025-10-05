using MediatR;
using NJS.Application.CQRS.MeasurementUnit.Queries;
using NJS.Application.DTOs;
using NJS.Repositories.Interfaces;
using System.Threading;
using System.Threading.Tasks;

namespace NJS.Application.CQRS.MeasurementUnit.Handlers
{
    public class GetMeasurementUnitByIdHandler : IRequestHandler<GetMeasurementUnitByIdQuery, MeasurementUnitDto>
    {
        private readonly IMeasurementUnitRepository _unitRepository;

        public GetMeasurementUnitByIdHandler(IMeasurementUnitRepository unitRepository)
        {
            _unitRepository = unitRepository;
        }

        public async Task<MeasurementUnitDto> Handle(GetMeasurementUnitByIdQuery request, CancellationToken cancellationToken)
        {
            var unit = await _unitRepository.GetByIdAsync(request.Id, request.FormType);

            if (unit == null)
            {
                return null;
            }

            return new MeasurementUnitDto
            {
                Id = unit.Id,
                Name = unit.Name,
                FormType = request.FormType
            };
        }
    }
}

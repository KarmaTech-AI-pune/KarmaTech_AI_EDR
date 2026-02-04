using MediatR;
using NJS.Application.CQRS.MeasurementUnit.Commands;
using NJS.Application.DTOs;
using NJS.Domain.Entities;
using NJS.Repositories.Interfaces;
using System.Threading;
using System.Threading.Tasks;

namespace NJS.Application.CQRS.MeasurementUnit.Handlers
{
    public class CreateMeasurementUnitHandler : IRequestHandler<CreateMeasurementUnitCommand, MeasurementUnitDto>
    {
        private readonly IMeasurementUnitRepository _unitRepository;

        public CreateMeasurementUnitHandler(IMeasurementUnitRepository unitRepository)
        {
            _unitRepository = unitRepository;
        }

        public async Task<MeasurementUnitDto> Handle(CreateMeasurementUnitCommand request, CancellationToken cancellationToken)
        {
            var measurementUnit = new NJS.Domain.Entities.MeasurementUnit
            {
                Name = request.Name,
                FormType = request.FormType
            };

            await _unitRepository.AddAsync(measurementUnit, request.FormType);

            return new MeasurementUnitDto
            {
                Id = measurementUnit.Id,
                Name = measurementUnit.Name,
                FormType = measurementUnit.FormType
            };
        }
    }
}

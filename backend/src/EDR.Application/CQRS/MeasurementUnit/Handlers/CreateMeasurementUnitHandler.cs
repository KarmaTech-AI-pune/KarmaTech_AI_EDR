using MediatR;
using EDR.Application.CQRS.MeasurementUnit.Commands;
using EDR.Application.DTOs;
using EDR.Domain.Entities;
using EDR.Repositories.Interfaces;
using System.Threading;
using System.Threading.Tasks;

namespace EDR.Application.CQRS.MeasurementUnit.Handlers
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
            var measurementUnit = new EDR.Domain.Entities.MeasurementUnit
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


using MediatR;
using EDR.Application.CQRS.MeasurementUnit.Commands;
using EDR.Application.DTOs;
using EDR.Domain.Entities;
using EDR.Repositories.Interfaces;
using System.Threading;
using System.Threading.Tasks;

namespace EDR.Application.CQRS.MeasurementUnit.Handlers
{
    public class UpdateMeasurementUnitHandler : IRequestHandler<UpdateMeasurementUnitCommand, MeasurementUnitDto>
    {
        private readonly IMeasurementUnitRepository _unitRepository;

        public UpdateMeasurementUnitHandler(IMeasurementUnitRepository unitRepository)
        {
            _unitRepository = unitRepository;
        }

        public async Task<MeasurementUnitDto> Handle(UpdateMeasurementUnitCommand request, CancellationToken cancellationToken)
        {
            var unit = await _unitRepository.GetByIdAsync(request.Id, request.FormType);

            if (unit == null)
            {
                return null; // Or throw an exception
            }

            unit.Name = request.Name;
            unit.FormType = request.FormType;

            await _unitRepository.UpdateAsync(unit, request.FormType);

            return new MeasurementUnitDto
            {
                Id = unit.Id,
                Name = unit.Name,
                FormType = request.FormType
            };
        }
    }
}


using MediatR;
using NJS.Application.CQRS.MeasurementUnit.Commands;
using NJS.Repositories.Interfaces;
using System.Threading;
using System.Threading.Tasks;

namespace NJS.Application.CQRS.MeasurementUnit.Handlers
{
    public class DeleteMeasurementUnitHandler : IRequestHandler<DeleteMeasurementUnitCommand>
    {
        private readonly IMeasurementUnitRepository _unitRepository;

        public DeleteMeasurementUnitHandler(IMeasurementUnitRepository unitRepository)
        {
            _unitRepository = unitRepository;
        }

        public async Task Handle(DeleteMeasurementUnitCommand request, CancellationToken cancellationToken)
        {
            await _unitRepository.DeleteAsync(request.Id, request.FormType);
        }
    }
}

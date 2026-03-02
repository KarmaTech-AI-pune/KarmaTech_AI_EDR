using MediatR;
using EDR.Domain.Entities;
using EDR.Repositories.Interfaces;
using System.Threading;
using System.Threading.Tasks;
using EDR.Application.CQRS.Cashflow.Commands;

namespace EDR.Application.CQRS.Cashflow.Handlers
{
    public class DeleteCashflowCommandHandler : IRequestHandler<DeleteCashflowCommand>
    {
        private readonly ICashflowRepository _cashflowRepository;

        public DeleteCashflowCommandHandler(ICashflowRepository cashflowRepository)
        {
            _cashflowRepository = cashflowRepository;
        }

        public async Task Handle(DeleteCashflowCommand request, CancellationToken cancellationToken)
        {
            var cashflow = await _cashflowRepository.GetByIdAsync(request.Id);

            if (cashflow == null)
            {
                return;
            }

            await _cashflowRepository.RemoveAsync(cashflow);
            await _cashflowRepository.SaveChangesAsync();
        }
    }
}


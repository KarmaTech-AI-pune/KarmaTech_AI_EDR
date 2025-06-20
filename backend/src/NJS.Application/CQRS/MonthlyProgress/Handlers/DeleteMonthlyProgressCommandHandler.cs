using MediatR;
using NJS.Application.CQRS.MonthlyProgress.Commands;
using NJS.Repositories.Interfaces;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace NJS.Application.CQRS.MonthlyProgress.Handlers
{
    public class DeleteMonthlyProgressCommandHandler : IRequestHandler<DeleteMonthlyProgressCommand, bool>
    {
        private readonly IMonthlyProgressRepository _monthlyProgressRepository;

        public DeleteMonthlyProgressCommandHandler(IMonthlyProgressRepository monthlyProgressRepository)
        {
            _monthlyProgressRepository = monthlyProgressRepository ?? throw new ArgumentNullException(nameof(monthlyProgressRepository));
        }

        public async Task<bool> Handle(DeleteMonthlyProgressCommand request, CancellationToken cancellationToken)
        {
            if (request == null)
            {
                throw new ArgumentNullException(nameof(request));
            }

            var monthlyProgressToDelete = await _monthlyProgressRepository.GetByIdAsync(request.Id);

            if (monthlyProgressToDelete == null)
            {
                return false; // MonthlyProgress not found
            }

            await _monthlyProgressRepository.DeleteAsync(monthlyProgressToDelete);

            return true;
        }
    }
}

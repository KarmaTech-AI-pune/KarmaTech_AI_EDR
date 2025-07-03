using MediatR;
using NJS.Application.CQRS.MonthlyProgress.Commands;
using NJS.Repositories.Interfaces;
using System.Threading;
using System.Threading.Tasks;
using NJS.Domain.Entities;
using System.Linq;
using NJS.Application.DTOs;

namespace NJS.Application.CQRS.MonthlyProgress.Handlers
{
    public class UpdateManpowerPlanningCommandHandler : IRequestHandler<UpdateManpowerPlanningCommand, ManpowerDto>
    {
        private readonly IMonthlyProgressRepository _monthlyProgressRepository;

        public UpdateManpowerPlanningCommandHandler(IMonthlyProgressRepository monthlyProgressRepository)
        {
            _monthlyProgressRepository = monthlyProgressRepository;
        }

        public async Task<ManpowerDto> Handle(UpdateManpowerPlanningCommand request, CancellationToken cancellationToken)
        {
            var monthlyProgress = await _monthlyProgressRepository.GetByIdAsync(request.MonthlyProgressId);
            var manpowerPlanning = monthlyProgress.ManpowerEntries.FirstOrDefault(x => x.Id == request.ManpowerPlanningId);

            if (manpowerPlanning == null)
            {
                return null;
            }

            manpowerPlanning.WorkAssignment = request.ManpowerPlanning.WorkAssignment;
            manpowerPlanning.Assignee = request.ManpowerPlanning.Assignee;
            manpowerPlanning.Planned = request.ManpowerPlanning.Planned ?? 0;
            manpowerPlanning.Consumed = request.ManpowerPlanning.Consumed ?? 0;
            manpowerPlanning.Balance = request.ManpowerPlanning.Balance ?? 0;
            manpowerPlanning.NextMonthPlanning = request.ManpowerPlanning.NextMonthPlanning ?? 0;
            manpowerPlanning.ManpowerComments = request.ManpowerPlanning.ManpowerComments;

            await _monthlyProgressRepository.UpdateManpowerPlanningAsync(manpowerPlanning);

            return new ManpowerDto
            {
                WorkAssignment = manpowerPlanning.WorkAssignment,
                Assignee = manpowerPlanning.Assignee,
                Planned = manpowerPlanning.Planned,
                Consumed = manpowerPlanning.Consumed,
                Balance = manpowerPlanning.Balance,
                NextMonthPlanning = manpowerPlanning.NextMonthPlanning,
                ManpowerComments = manpowerPlanning.ManpowerComments
            };
        }
    }
}

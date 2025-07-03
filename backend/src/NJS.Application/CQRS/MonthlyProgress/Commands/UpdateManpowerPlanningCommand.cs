using MediatR;
using NJS.Application.DTOs;

namespace NJS.Application.CQRS.MonthlyProgress.Commands
{
    public class UpdateManpowerPlanningCommand : IRequest<ManpowerDto>
    {
        public int MonthlyProgressId { get; set; }
        public int ManpowerPlanningId { get; set; }
        public ManpowerDto ManpowerPlanning { get; set; }
    }
}

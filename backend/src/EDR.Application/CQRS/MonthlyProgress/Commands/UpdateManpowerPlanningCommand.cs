using MediatR;
using EDR.Application.DTOs;

namespace EDR.Application.CQRS.MonthlyProgress.Commands
{
    public class UpdateManpowerPlanningCommand : IRequest<ManpowerDto>
    {
        public int MonthlyProgressId { get; set; }
        public int ManpowerPlanningId { get; set; }
        public ManpowerDto ManpowerPlanning { get; set; }
    }
}


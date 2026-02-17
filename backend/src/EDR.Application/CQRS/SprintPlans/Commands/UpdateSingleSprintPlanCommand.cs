using MediatR;
using EDR.Application.Dtos;

namespace EDR.Application.CQRS.SprintPlans.Commands
{
    public class UpdateSingleSprintPlanCommand : IRequest<bool>
    {
        public SprintPlanInputDto SprintPlan { get; set; }
    }
}


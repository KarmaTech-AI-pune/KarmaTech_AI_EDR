using MediatR;
using EDR.Application.Dtos;

namespace EDR.Application.CQRS.SprintPlans.Commands
{
    public class CreateSingleSprintPlanCommand : IRequest<int>
    {
        public SprintPlanInputDto SprintPlan { get; set; }
    }
}


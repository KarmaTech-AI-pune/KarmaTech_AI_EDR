using MediatR;
using NJS.Application.Dtos;

namespace NJS.Application.CQRS.SprintPlans.Commands
{
    public class CreateSingleSprintPlanCommand : IRequest<int>
    {
        public SprintPlanDto SprintPlan { get; set; }
    }
}

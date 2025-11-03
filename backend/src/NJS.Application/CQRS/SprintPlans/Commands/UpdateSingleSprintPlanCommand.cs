using MediatR;
using NJS.Application.Dtos;

namespace NJS.Application.CQRS.SprintPlans.Commands
{
    public class UpdateSingleSprintPlanCommand : IRequest<bool>
    {
        public SprintPlanDto SprintPlan { get; set; }
    }
}

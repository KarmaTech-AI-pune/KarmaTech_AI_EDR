using MediatR;
using NJS.Application.Dtos;

namespace NJS.Application.CQRS.SprintPlans.Queries
{
    public class GetSingleSprintPlanQuery : IRequest<SprintPlanDto?>
    {
        public int SprintId { get; set; }
    }
}

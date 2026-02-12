using MediatR;
using NJS.Application.Dtos;

namespace NJS.Application.CQRS.SprintPlans.Queries
{
    public class GetNextSprintQuery : IRequest<SprintPlanDto?>
    {
        public int ProjectId { get; set; }
        public int CurrentSprintId { get; set; }
    }
}

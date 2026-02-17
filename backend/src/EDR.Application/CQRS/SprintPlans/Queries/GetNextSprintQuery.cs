using MediatR;
using EDR.Application.Dtos;

namespace EDR.Application.CQRS.SprintPlans.Queries
{
    public class GetNextSprintQuery : IRequest<SprintPlanDto?>
    {
        public int ProjectId { get; set; }
        public int CurrentSprintId { get; set; }
    }
}


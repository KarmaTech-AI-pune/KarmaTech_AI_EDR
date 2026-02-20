using MediatR;
using EDR.Application.Dtos;

namespace EDR.Application.CQRS.SprintPlans.Queries
{
    public class GetSingleSprintPlanQuery : IRequest<SprintPlanDto?>
    {
        public int SprintId { get; set; }
        public int? ProjectId { get; set; }  // Optional for backward compatibility
    }
}


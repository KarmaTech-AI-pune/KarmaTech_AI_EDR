using MediatR;
using EDR.Application.Dtos;
using System.Collections.Generic;

namespace EDR.Application.CQRS.SprintDailyProgresses.Queries
{
    public class GetSprintDailyProgressBySprintPlanIdQuery : IRequest<IEnumerable<SprintDailyProgressDto>>
    {
        public int SprintPlanId { get; set; }
    }
}


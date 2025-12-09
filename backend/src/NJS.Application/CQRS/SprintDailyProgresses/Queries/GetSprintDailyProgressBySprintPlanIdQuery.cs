using MediatR;
using NJS.Application.Dtos;
using System.Collections.Generic;

namespace NJS.Application.CQRS.SprintDailyProgresses.Queries
{
    public class GetSprintDailyProgressBySprintPlanIdQuery : IRequest<IEnumerable<SprintDailyProgressDto>>
    {
        public int SprintPlanId { get; set; }
    }
}

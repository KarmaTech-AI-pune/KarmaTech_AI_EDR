using MediatR;
using EDR.Application.Dtos;
using System.Collections.Generic;

namespace EDR.Application.CQRS.SprintTasks.Queries
{
    public class GetAllSprintTasksByProjectIdQuery : IRequest<IEnumerable<SprintTaskSummaryDto>>
    {
        public int ProjectId { get; set; }
    }
}


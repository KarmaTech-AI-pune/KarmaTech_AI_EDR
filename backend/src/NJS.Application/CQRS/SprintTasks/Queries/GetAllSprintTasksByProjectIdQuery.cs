using MediatR;
using NJS.Application.Dtos;
using System.Collections.Generic;

namespace NJS.Application.CQRS.SprintTasks.Queries
{
    public class GetAllSprintTasksByProjectIdQuery : IRequest<IEnumerable<SprintTaskSummaryDto>>
    {
        public int ProjectId { get; set; }
    }
}

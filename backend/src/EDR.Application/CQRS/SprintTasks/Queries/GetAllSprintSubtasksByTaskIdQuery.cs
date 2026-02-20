using MediatR;
using EDR.Application.Dtos;
using System.Collections.Generic;

namespace EDR.Application.CQRS.SprintTasks.Queries
{
    public class GetAllSprintSubtasksByTaskIdQuery : IRequest<IEnumerable<SprintSubtaskDto>>
    {
        public int TaskId { get; set; }
    }
}


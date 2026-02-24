using MediatR;
using EDR.Application.Dtos;

namespace EDR.Application.CQRS.SprintTasks.Queries
{
    public class GetSingleSprintTaskQuery : IRequest<SprintTaskDto>
    {
        public int TaskId { get; set; }
    }
}


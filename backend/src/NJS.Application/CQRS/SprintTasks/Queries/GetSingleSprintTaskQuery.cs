using MediatR;
using NJS.Application.Dtos;

namespace NJS.Application.CQRS.SprintTasks.Queries
{
    public class GetSingleSprintTaskQuery : IRequest<SprintTaskDto>
    {
        public int TaskId { get; set; }
    }
}

using MediatR;
using NJS.Application.Dtos;

namespace NJS.Application.CQRS.SprintTasks.Queries
{
    public class GetSprintSubtaskByIdQuery : IRequest<SprintSubtaskDto>
    {
        public int SubtaskId { get; set; }
    }
}

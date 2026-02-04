using MediatR;
using NJS.Application.Dtos;

namespace NJS.Application.CQRS.SprintTasks.Queries
{
    public class GetSprintTaskCommentQuery : IRequest<List<SprintTaskCommentDto>>
    {
        public int TaskId { get; set; }
    }
}

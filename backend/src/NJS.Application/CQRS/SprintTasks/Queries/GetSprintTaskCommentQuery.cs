using MediatR;
using NJS.Application.Dtos;

namespace NJS.Application.CQRS.SprintTasks.Queries
{
    public class GetSprintTaskCommentQuery : IRequest<List<SprintTaskCommentDto>>
    {
        public string TaskId { get; set; }
    }
}

using MediatR;
using NJS.Application.Dtos;

namespace NJS.Application.CQRS.SprintTasks.Queries
{
    public class GetSprintTaskCommentByIdQuery : IRequest<SprintTaskCommentDto>
    {
        public int CommentId { get; set; }
    }
}

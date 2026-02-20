using MediatR;
using EDR.Application.Dtos;

namespace EDR.Application.CQRS.SprintTasks.Queries
{
    public class GetSprintTaskCommentByIdQuery : IRequest<SprintTaskCommentDto>
    {
        public int CommentId { get; set; }
    }
}


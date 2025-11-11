using MediatR;
using NJS.Application.Dtos;

namespace NJS.Application.CQRS.SprintSubtasks.Queries
{
    public class GetSprintSubtaskCommentByIdQuery : IRequest<SprintSubtaskCommentDto?>
    {
        public int SubtaskCommentId { get; set; }
    }
}

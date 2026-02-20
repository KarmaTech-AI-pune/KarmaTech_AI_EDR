using MediatR;
using EDR.Application.Dtos;

namespace EDR.Application.CQRS.SprintSubtasks.Queries
{
    public class GetSprintSubtaskCommentByIdQuery : IRequest<SprintSubtaskCommentDto?>
    {
        public int SubtaskCommentId { get; set; }
    }
}


using MediatR;
using EDR.Application.Dtos;

namespace EDR.Application.CQRS.SprintTasks.Queries
{
    public class GetSprintTaskCommentQuery : IRequest<List<SprintTaskCommentDto>>
    {
        public int TaskId { get; set; }
    }
}


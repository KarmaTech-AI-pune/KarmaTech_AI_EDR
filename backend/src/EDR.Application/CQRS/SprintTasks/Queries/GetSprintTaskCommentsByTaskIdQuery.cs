using MediatR;
using EDR.Application.Dtos;

namespace EDR.Application.CQRS.SprintTasks.Queries
{
    public class GetSprintTaskCommentsByTaskIdQuery : IRequest<SprintTaskCommentsWithTotalDto>
    {
        public int Taskid { get; set; }
    }
}


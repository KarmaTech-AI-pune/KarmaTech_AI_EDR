using MediatR;
using EDR.Application.Dtos;

namespace EDR.Application.CQRS.SprintTasks.Queries
{
    public class GetSingleSprintSubtaskQuery : IRequest<SprintSubtaskDto>
    {
        public int SubtaskId { get; set; }
    }
}


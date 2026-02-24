using MediatR;
using EDR.Application.Dtos;

namespace EDR.Application.CQRS.SprintTasks.Queries
{
    public class GetSprintSubtaskByIdQuery : IRequest<SprintSubtaskDto>
    {
        public int SubtaskId { get; set; }
    }
}


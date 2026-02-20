using MediatR;
using EDR.Application.Dtos;

namespace EDR.Application.CQRS.SprintTasks.Commands
{
    public class CreateSprintTaskCommand : IRequest<int>
    {
        public SprintTaskInputDto? SprintTask { get; set; }
    }
}


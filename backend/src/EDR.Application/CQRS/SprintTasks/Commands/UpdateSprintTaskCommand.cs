using MediatR;
using EDR.Application.Dtos;

namespace EDR.Application.CQRS.SprintTasks.Commands
{
    public class UpdateSprintTaskCommand : IRequest<bool>
    {
        public SprintTaskInputDto SprintTask { get; set; }
    }
}


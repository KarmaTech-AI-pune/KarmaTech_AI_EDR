using MediatR;
using NJS.Application.Dtos;

namespace NJS.Application.CQRS.SprintTasks.Commands
{
    public class UpdateSprintTaskCommand : IRequest<bool>
    {
        public SprintTaskInputDto SprintTask { get; set; }
    }
}

using MediatR;
using NJS.Application.Dtos;

namespace NJS.Application.CQRS.SprintTasks.Commands
{
    public class UpdateSprintTaskCommand : IRequest<bool>
    {
        public SprintTaskDto SprintTask { get; set; }
    }
}

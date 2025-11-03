using MediatR;
using NJS.Application.Dtos;

namespace NJS.Application.CQRS.SprintTasks.Commands
{
    public class CreateSprintTaskCommand : IRequest<string>
    {
        public SprintTaskDto SprintTask { get; set; }
    }
}

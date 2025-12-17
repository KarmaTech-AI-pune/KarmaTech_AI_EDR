using MediatR;
using NJS.Application.Dtos;

namespace NJS.Application.CQRS.SprintTasks.Commands
{
    public class CreateSprintTaskCommand : IRequest<int>
    {
        public SprintTaskInputDto? SprintTask { get; set; }
    }
}

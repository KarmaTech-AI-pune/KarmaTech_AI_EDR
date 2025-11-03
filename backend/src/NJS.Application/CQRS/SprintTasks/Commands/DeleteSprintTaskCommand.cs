using MediatR;
using System;

namespace NJS.Application.CQRS.SprintTasks.Commands
{
    public class DeleteSprintTaskCommand : IRequest<bool>
    {
        public string TaskId { get; set; }
    }
}

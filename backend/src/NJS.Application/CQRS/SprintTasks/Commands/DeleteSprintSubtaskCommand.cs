using MediatR;
using System;

namespace NJS.Application.CQRS.SprintTasks.Commands
{
    public class DeleteSprintSubtaskCommand : IRequest<bool>
    {
        public int SubtaskId { get; set; }
    }
}

using MediatR;
using NJS.Application.Dtos;
using System.Collections.Generic;

namespace NJS.Application.CQRS.SprintTasks.Queries
{
    public class GetAllSprintSubtasksByTaskIdQuery : IRequest<IEnumerable<SprintSubtaskDto>>
    {
        public string TaskId { get; set; } = string.Empty;
    }
}

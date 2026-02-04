using MediatR;
using System.Collections.Generic;
using NJS.Application.Dtos;

namespace NJS.Application.CQRS.SprintTasks.Queries
{
    public class GetSprintTaskCommentsByTaskIdQuery : IRequest<List<SprintTaskCommentDto>>
    {
        public int Taskid { get; set; }
    }
}

using MediatR;
using System.Collections.Generic;
using EDR.Application.Dtos;

namespace EDR.Application.CQRS.SprintTasks.Queries
{
    public class GetSprintTaskCommentsByTaskIdQuery : IRequest<List<SprintTaskCommentDto>>
    {
        public int Taskid { get; set; }
    }
}


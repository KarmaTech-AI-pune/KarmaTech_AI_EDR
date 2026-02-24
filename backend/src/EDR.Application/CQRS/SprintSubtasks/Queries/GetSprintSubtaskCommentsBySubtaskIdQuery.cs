using MediatR;
using System.Collections.Generic;
using EDR.Application.Dtos;

namespace EDR.Application.CQRS.SprintSubtasks.Queries
{
    public class GetSprintSubtaskCommentsBySubtaskIdQuery : IRequest<List<SprintSubtaskCommentDto>>
    {
        public int SubtaskId { get; set; }
    }
}


using MediatR;
using System.Collections.Generic;
using NJS.Application.Dtos;

namespace NJS.Application.CQRS.SprintSubtasks.Queries
{
    public class GetSprintSubtaskCommentsBySubtaskIdQuery : IRequest<List<SprintSubtaskCommentDto>>
    {
        public int SubtaskId { get; set; }
    }
}

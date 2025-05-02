using MediatR;
using NJS.Application.Dtos;
using System.Collections.Generic;

namespace NJS.Application.CQRS.ProjectClosure.Queries
{
    public class GetProjectClosuresByProjectIdQuery : IRequest<IEnumerable<ProjectClosureDto>>
    {
        public int ProjectId { get; }

        public GetProjectClosuresByProjectIdQuery(int projectId)
        {
            ProjectId = projectId;
        }
    }
}

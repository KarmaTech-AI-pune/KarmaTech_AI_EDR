using MediatR;
using EDR.Application.Dtos;
using System.Collections.Generic;

namespace EDR.Application.CQRS.ProjectClosure.Queries
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


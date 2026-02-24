using MediatR;
using EDR.Application.Dtos;

namespace EDR.Application.CQRS.ProjectClosure.Queries
{
    public class GetProjectClosureByProjectIdQuery : IRequest<ProjectClosureDto>
    {
        public int ProjectId { get; }

        public GetProjectClosureByProjectIdQuery(int projectId)
        {
            ProjectId = projectId;
        }
    }
}


using MediatR;
using NJS.Application.Dtos;

namespace NJS.Application.CQRS.ProjectClosure.Queries
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

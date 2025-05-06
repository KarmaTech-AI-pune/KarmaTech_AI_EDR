using MediatR;
using NJS.Application.Dtos;

namespace NJS.Application.CQRS.ProjectClosure.Queries
{
    public class GetProjectClosureByIdQuery : IRequest<ProjectClosureDto>
    {
        public int Id { get; }

        public GetProjectClosureByIdQuery(int id)
        {
            Id = id;
        }
    }
}

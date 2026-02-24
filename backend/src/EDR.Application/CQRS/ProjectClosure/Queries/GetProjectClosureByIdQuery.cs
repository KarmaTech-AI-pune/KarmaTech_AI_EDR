using MediatR;
using EDR.Application.Dtos;

namespace EDR.Application.CQRS.ProjectClosure.Queries
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


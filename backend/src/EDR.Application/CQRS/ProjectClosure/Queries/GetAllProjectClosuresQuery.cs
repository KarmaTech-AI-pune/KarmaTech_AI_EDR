using MediatR;
using EDR.Application.Dtos;
using System.Collections.Generic;

namespace EDR.Application.CQRS.ProjectClosure.Queries
{
    public class GetAllProjectClosuresQuery : IRequest<IEnumerable<ProjectClosureDto>>
    {
    }
}


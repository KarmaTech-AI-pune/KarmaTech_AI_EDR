using MediatR;
using NJS.Application.Dtos;
using System.Collections.Generic;

namespace NJS.Application.CQRS.ProjectClosure.Queries
{
    public class GetAllProjectClosuresQuery : IRequest<IEnumerable<ProjectClosureDto>>
    {
    }
}

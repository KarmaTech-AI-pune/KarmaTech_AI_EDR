using MediatR;
using NJS.Domain.Entities;
using System.Collections.Generic;

namespace NJS.Application.CQRS.Projects.Queries
{
    public record GetAllProjectsQuery : IRequest<IEnumerable<Project>>
    {
        public int? ProgramId { get; init; }
    }
}

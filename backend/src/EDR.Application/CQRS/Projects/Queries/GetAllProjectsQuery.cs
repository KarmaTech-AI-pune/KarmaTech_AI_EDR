using MediatR;
using EDR.Domain.Entities;
using System.Collections.Generic;

namespace EDR.Application.CQRS.Projects.Queries
{
    public record GetAllProjectsQuery : IRequest<IEnumerable<Project>>
    {
        /// <summary>
        /// Optional: Filter projects by ProgramId. If null, returns all projects.
        /// </summary>
        public int? ProgramId { get; init; }
    }
}

using MediatR;
using EDR.Application.Dtos;

namespace EDR.Application.CQRS.Projects.Queries
{
    /// <summary>
    /// Query to get budget health status for a project
    /// </summary>
    public record GetBudgetHealthQuery : IRequest<BudgetHealthDto>
    {
        /// <summary>
        /// The project ID to get budget health for
        /// </summary>
        public int ProjectId { get; init; }
    }
}


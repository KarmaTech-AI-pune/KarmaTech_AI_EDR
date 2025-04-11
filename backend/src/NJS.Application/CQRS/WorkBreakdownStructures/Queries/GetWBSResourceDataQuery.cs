using MediatR;
using NJS.Application.Dtos;

namespace NJS.Application.CQRS.WorkBreakdownStructures.Queries
{
    /// <summary>
    /// Query to get WBS resource allocation data for a specific project
    /// </summary>
    public class GetWBSResourceDataQuery : IRequest<WBSResourceDataDto>
    {
        public int ProjectId { get; }

        public GetWBSResourceDataQuery(int projectId)
        {
            ProjectId = projectId;
        }
    }
}

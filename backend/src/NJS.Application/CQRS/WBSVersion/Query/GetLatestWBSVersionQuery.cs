using MediatR;
using NJS.Application.Dtos;

namespace NJS.Application.CQRS.WorkBreakdownStructures.Queries
{
    public class GetLatestWBSVersionQuery : IRequest<WBSVersionDto>
    {
        public int ProjectId { get; set; }

        public GetLatestWBSVersionQuery(int projectId)
        {
            ProjectId = projectId;
        }
    }
}

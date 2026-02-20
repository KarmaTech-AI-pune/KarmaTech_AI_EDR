using MediatR;
using EDR.Application.Dtos;

namespace EDR.Application.CQRS.WorkBreakdownStructures.Queries
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


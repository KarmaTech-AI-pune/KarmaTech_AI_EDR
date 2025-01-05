using MediatR;
using NJS.Application.Dtos;

namespace NJS.Application.CQRS.OpportunityTracking.Queries
{
    public class GetOpportunityTrackingsByBidManagerQuery : IRequest<IEnumerable<OpportunityTrackingDto>>
    {
        public string BidManagerId { get; }

        public GetOpportunityTrackingsByBidManagerQuery(string bidManagerId)
        {
            BidManagerId = bidManagerId;
        }
    }
}

using MediatR;
using EDR.Application.Dtos;

namespace EDR.Application.CQRS.OpportunityTracking.Queries
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


using MediatR;
using EDR.Application.Dtos;

namespace EDR.Application.CQRS.OpportunityTracking.Queries
{
    public class GetOpportunityTrackingsByRegionalManagerQuery : IRequest<IEnumerable<OpportunityTrackingDto>>
    {
        public string RegionalManagerId { get; }

        public GetOpportunityTrackingsByRegionalManagerQuery(string regionalManagerId)
        {
            RegionalManagerId = regionalManagerId;
        }
    }
}


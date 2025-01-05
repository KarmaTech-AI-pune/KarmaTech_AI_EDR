using MediatR;
using NJS.Application.Dtos;

namespace NJS.Application.CQRS.OpportunityTracking.Queries
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

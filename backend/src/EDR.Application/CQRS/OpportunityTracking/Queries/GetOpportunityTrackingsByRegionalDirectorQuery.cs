using MediatR;
using EDR.Application.Dtos;

namespace EDR.Application.CQRS.OpportunityTracking.Queries
{
    public class GetOpportunityTrackingsByRegionalDirectorQuery : IRequest<IEnumerable<OpportunityTrackingDto>>
    {
        public string RegionalDirectorId { get; }

        public GetOpportunityTrackingsByRegionalDirectorQuery(string regionalDirectorId)
        {
            RegionalDirectorId = regionalDirectorId;
        }
    }
}


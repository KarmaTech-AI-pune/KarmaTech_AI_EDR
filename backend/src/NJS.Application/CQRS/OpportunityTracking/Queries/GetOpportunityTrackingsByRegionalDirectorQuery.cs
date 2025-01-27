using MediatR;
using NJS.Application.Dtos;

namespace NJS.Application.CQRS.OpportunityTracking.Queries
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

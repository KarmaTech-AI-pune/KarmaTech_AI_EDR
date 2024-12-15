using MediatR;
using NJS.Application.Dtos;

namespace NJS.Application.CQRS.OpportunityTracking.Queries
{
    public class GetOpportunityTrackingByIdQuery : IRequest<OpportunityTrackingDto>
    {
        public int Id { get; set; }

        public GetOpportunityTrackingByIdQuery(int id)
        {
            Id = id;
        }
    }
}

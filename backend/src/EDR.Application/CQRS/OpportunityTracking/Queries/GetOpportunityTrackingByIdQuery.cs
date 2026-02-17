using MediatR;
using EDR.Application.Dtos;

namespace EDR.Application.CQRS.OpportunityTracking.Queries
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


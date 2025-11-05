using MediatR;
using NJS.Application.Dtos;

namespace NJS.Application.CQRS.OpportunityTracking.Commands
{
    public class RejectOpportunityCommand : IRequest<OpportunityTrackingDto>
    {
        public int OpportunityId { get; set; }
        public string? AssignedToId { get; set; }
        public string? Action { get; set; }
        public string? Comments { get; set; }
    }
}

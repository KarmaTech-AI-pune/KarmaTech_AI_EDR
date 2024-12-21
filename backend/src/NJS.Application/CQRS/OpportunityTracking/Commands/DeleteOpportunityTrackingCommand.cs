using MediatR;

namespace NJS.Application.CQRS.OpportunityTracking.Commands
{
    public class DeleteOpportunityTrackingCommand : IRequest<bool>
    {
        public int Id { get; set; }

        public DeleteOpportunityTrackingCommand(int id)
        {
            Id = id;
        }
    }
}

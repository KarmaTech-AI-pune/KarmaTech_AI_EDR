using MediatR;

namespace NJS.Application.CQRS.Commands.BidPreparation
{
    public class ApproveBidPreparationCommand : IRequest<bool>
    {
        public string UserId { get; set; }
        public int OpportunityId { get; set; }
        public bool IsApproved { get; set; }
        public string Comments { get; set; }
        public string CreatedBy { get; set; }
    }
}

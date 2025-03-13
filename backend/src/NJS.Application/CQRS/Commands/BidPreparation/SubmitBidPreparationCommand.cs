using MediatR;

namespace NJS.Application.CQRS.Commands.BidPreparation
{
    public class SubmitBidPreparationCommand : IRequest<bool>
    {
        public string UserId { get; set; }
        public string RegionalMangerId { get; set; }
        public int OpportunityId { get; set; }
        public string CreatedBy { get; set; }
    }
}

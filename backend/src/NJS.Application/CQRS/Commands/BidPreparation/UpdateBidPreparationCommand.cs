using MediatR;

namespace NJS.Application.CQRS.Commands.BidPreparation
{
    public class UpdateBidPreparationCommand : IRequest<bool>
    {
        public string DocumentCategoriesJson { get; set; }
        public int OpportunityId { get; set; }
        public string UserId { get; set; }
    }
}

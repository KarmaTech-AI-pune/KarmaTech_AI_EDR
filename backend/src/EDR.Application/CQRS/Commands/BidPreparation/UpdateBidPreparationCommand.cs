using MediatR;
using EDR.Domain.Entities;

namespace EDR.Application.CQRS.Commands.BidPreparation
{
    public class UpdateBidPreparationCommand : IRequest<bool>
    {
        public string DocumentCategoriesJson { get; set; }
        public int OpportunityId { get; set; }
        public string UserId { get; set; }       
        public string CreatedBy { get; set; }       
        public string Comments { get; set; }
    }
}


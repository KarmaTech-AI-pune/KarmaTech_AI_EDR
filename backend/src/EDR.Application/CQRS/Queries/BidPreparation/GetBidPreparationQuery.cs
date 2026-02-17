using System.Collections.Generic;
using MediatR;
using EDR.Application.Dtos;

namespace EDR.Application.CQRS.Queries.BidPreparation
{
    public class GetBidPreparationQuery : IRequest<BidPreparationDto>
    {
        public string UserId { get; set; }
        public int OpportunityId { get; set; }
    }

    public class GetBidVersionHistoryQuery : IRequest<List<BidVersionHistoryDto>>
    {
        public int OpportunityId { get; set; }
        public string UserId { get; set; }
    }
}


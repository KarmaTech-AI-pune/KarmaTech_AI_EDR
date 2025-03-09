using System.Collections.Generic;
using MediatR;
using NJS.Application.Dtos;

namespace NJS.Application.CQRS.Queries.BidPreparation
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

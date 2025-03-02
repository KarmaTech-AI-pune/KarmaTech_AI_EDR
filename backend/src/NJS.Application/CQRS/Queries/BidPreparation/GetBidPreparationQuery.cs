using MediatR;
using NJS.Application.Dtos;

namespace NJS.Application.CQRS.Queries.BidPreparation
{
    public class GetBidPreparationQuery : IRequest<BidPreparationDto>
    {
        public string UserId { get; set; }
    }
}

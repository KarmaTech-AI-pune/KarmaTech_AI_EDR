using MediatR;
using EDR.Application.DTOs;

namespace EDR.Application.CQRS.Subscriptions.Queries
{
    public class GetAllSubscriptionFeaturesQuery : IRequest<SubscriptionFeaturesResponseDto>
    {
    }
}


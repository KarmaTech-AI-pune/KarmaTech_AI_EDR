using MediatR;
using NJS.Application.DTOs;

namespace NJS.Application.CQRS.Subscriptions.Queries
{
    public class GetAllSubscriptionFeaturesQuery : IRequest<SubscriptionFeaturesResponseDto>
    {
    }
}

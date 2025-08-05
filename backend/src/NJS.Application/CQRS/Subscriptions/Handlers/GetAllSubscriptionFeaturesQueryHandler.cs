using MediatR;
using Microsoft.Extensions.Logging;
using NJS.Application.CQRS.Subscriptions.Queries;
using NJS.Application.DTOs;
using NJS.Application.Services.IContract;
using System.Threading;
using System.Threading.Tasks;

namespace NJS.Application.CQRS.Subscriptions.Handlers
{
    public class GetAllSubscriptionFeaturesQueryHandler : IRequestHandler<GetAllSubscriptionFeaturesQuery, SubscriptionFeaturesResponseDto>
    {
        private readonly ISubscriptionService _subscriptionService;
        private readonly ILogger<GetAllSubscriptionFeaturesQueryHandler> _logger;

        public GetAllSubscriptionFeaturesQueryHandler(
            ISubscriptionService subscriptionService,
            ILogger<GetAllSubscriptionFeaturesQueryHandler> logger)
        {
            _subscriptionService = subscriptionService;
            _logger = logger;
        }

        public async Task<SubscriptionFeaturesResponseDto> Handle(GetAllSubscriptionFeaturesQuery request, CancellationToken cancellationToken)
        {
            _logger.LogInformation("Getting all subscription plans with features, pricing, and limitations via CQRS");

            try
            {
                var response = await _subscriptionService.GetAllSubscriptionFeaturesAsync();
                _logger.LogInformation("Successfully retrieved {Count} subscription plans with details via CQRS", response.Plans.Count);
                return response;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving subscription plans with details");
                throw;
            }
        }
    }
}

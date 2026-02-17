using MediatR;
using EDR.Application.DTOs;
using EDR.Repositories.Interfaces;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using EDR.Application.CQRS.Feature.Queries;

namespace EDR.Application.CQRS.Feature.Handlers
{
    public class GetFeatureByIdQueryHandler : IRequestHandler<GetFeatureByIdQuery, FeatureDto>
    {
        private readonly IFeatureRepository _featureRepository;
        private readonly ILogger<GetFeatureByIdQueryHandler> _logger;

        public GetFeatureByIdQueryHandler(IFeatureRepository featureRepository, ILogger<GetFeatureByIdQueryHandler> logger)
        {
            _featureRepository = featureRepository;
            _logger = logger;
        }

        public async Task<FeatureDto> Handle(GetFeatureByIdQuery request, CancellationToken cancellationToken)
        {
            _logger.LogInformation($"Getting feature by id: {request.Id}");
            var feature = await _featureRepository.GetFeatureByIdAsync(request.Id);

            if (feature == null)
            {
                _logger.LogWarning($"Feature not found with id: {request.Id}");
                return null;
            }

            return new FeatureDto
            {
                Id = feature.Id,
                Name = feature.Name,
                Description = feature.Description,
                IsActive = feature.IsActive
            };
        }
    }
}


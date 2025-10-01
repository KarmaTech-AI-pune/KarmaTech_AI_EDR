using MediatR;
using NJS.Application.DTOs;
using NJS.Repositories.Interfaces;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using NJS.Application.CQRS.Feature.Queries;

namespace NJS.Application.CQRS.Feature.Handlers
{
    public class GetAllFeaturesQueryHandler : IRequestHandler<GetAllFeaturesQuery, List<FeatureDto>>
    {
        private readonly IFeatureRepository _featureRepository;
        private readonly ILogger<GetAllFeaturesQueryHandler> _logger;

        public GetAllFeaturesQueryHandler(IFeatureRepository featureRepository, ILogger<GetAllFeaturesQueryHandler> logger)
        {
            _featureRepository = featureRepository;
            _logger = logger;
        }

        public async Task<List<FeatureDto>> Handle(GetAllFeaturesQuery request, CancellationToken cancellationToken)
        {
            _logger.LogInformation("Getting all features");
            var features = await _featureRepository.GetAllFeaturesAsync();

            if (features == null)
            {
                _logger.LogWarning("No features found");
                return new List<FeatureDto>();
            }

            var featureDtos = new List<FeatureDto>();
            foreach (var feature in features)
            {
                featureDtos.Add(new FeatureDto
                {
                    Id = feature.Id,
                    Name = feature.Name,
                    Description = feature.Description,
                    PriceUSD = feature.PriceUSD,
                    PriceINR = feature.PriceINR
                });
            }

            return featureDtos;
        }
    }
}

using MediatR;
using NJS.Application.DTOs;
using NJS.Domain.Entities;
using NJS.Repositories.Interfaces;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using NJS.Application.CQRS.Feature.Commands;

namespace NJS.Application.CQRS.Feature.Handlers
{
    public class CreateFeatureCommandHandler : IRequestHandler<CreateFeatureCommand, FeatureDto>
    {
        private readonly IFeatureRepository _featureRepository;
        private readonly ILogger<CreateFeatureCommandHandler> _logger;

        public CreateFeatureCommandHandler(IFeatureRepository featureRepository, ILogger<CreateFeatureCommandHandler> logger)
        {
            _featureRepository = featureRepository;
            _logger = logger;
        }

        public async Task<FeatureDto> Handle(CreateFeatureCommand request, CancellationToken cancellationToken)
        {
            var feature = new NJS.Domain.Entities.Feature
            {
                Name = request.Name,
                Description = request.Description,
                IsActive = request.IsActive
            };

            await _featureRepository.AddFeatureAsync(feature);

            _logger.LogInformation($"Feature created successfully: {feature.Name}");

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

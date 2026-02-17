using MediatR;
using EDR.Application.DTOs;
using EDR.Repositories.Interfaces;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using EDR.Application.CQRS.Feature.Commands;

namespace EDR.Application.CQRS.Feature.Handlers
{
    public class UpdateFeatureCommandHandler : IRequestHandler<UpdateFeatureCommand, FeatureDto>
    {
        private readonly IFeatureRepository _featureRepository;
        private readonly ILogger<UpdateFeatureCommandHandler> _logger;

        public UpdateFeatureCommandHandler(IFeatureRepository featureRepository, ILogger<UpdateFeatureCommandHandler> logger)
        {
            _featureRepository = featureRepository;
            _logger = logger;
        }

        public async Task<FeatureDto> Handle(UpdateFeatureCommand request, CancellationToken cancellationToken)
        {
            _logger.LogInformation($"Updating feature with id: {request.Id}");
            var feature = await _featureRepository.GetFeatureByIdAsync(request.Id);

            if (feature == null)
            {
                _logger.LogWarning($"Feature not found with id: {request.Id}");
                return null;
            }

            feature.Name = request.Name;
            feature.Description = request.Description;
            feature.IsActive = request.IsActive;

            await _featureRepository.UpdateFeatureAsync(feature);

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


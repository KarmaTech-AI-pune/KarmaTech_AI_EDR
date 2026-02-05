using MediatR;
using NJS.Repositories.Interfaces;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using NJS.Application.CQRS.Feature.Commands;

namespace NJS.Application.CQRS.Feature.Handlers
{
    public class DeleteFeatureCommandHandler : IRequestHandler<DeleteFeatureCommand, bool>
    {
        private readonly IFeatureRepository _featureRepository;
        private readonly ILogger<DeleteFeatureCommandHandler> _logger;

        public DeleteFeatureCommandHandler(IFeatureRepository featureRepository, ILogger<DeleteFeatureCommandHandler> logger)
        {
            _featureRepository = featureRepository;
            _logger = logger;
        }

        public async Task<bool> Handle(DeleteFeatureCommand request, CancellationToken cancellationToken)
        {
            _logger.LogInformation($"Deleting feature with id: {request.Id}");
            var feature = await _featureRepository.GetFeatureByIdAsync(request.Id);

            if (feature == null)
            {
                _logger.LogWarning($"Feature not found with id: {request.Id}");
                return false;
            }

            await _featureRepository.DeleteFeatureAsync(request.Id);
            return true;
        }
    }
}

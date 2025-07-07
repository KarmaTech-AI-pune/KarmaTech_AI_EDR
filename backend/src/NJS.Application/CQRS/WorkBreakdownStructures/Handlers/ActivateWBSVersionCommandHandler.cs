using MediatR;
using Microsoft.Extensions.Logging;
using NJS.Application.CQRS.WorkBreakdownStructures.Commands;
using NJS.Repositories.Interfaces;
using System.Threading;
using System.Threading.Tasks;

namespace NJS.Application.CQRS.WorkBreakdownStructures.Handlers
{
    public class ActivateWBSVersionCommandHandler : IRequestHandler<ActivateWBSVersionCommand, Unit>
    {
        private readonly IWBSVersionRepository _wbsVersionRepository;
        private readonly ILogger<ActivateWBSVersionCommandHandler> _logger;

        public ActivateWBSVersionCommandHandler(
            IWBSVersionRepository wbsVersionRepository,
            ILogger<ActivateWBSVersionCommandHandler> logger)
        {
            _wbsVersionRepository = wbsVersionRepository;
            _logger = logger;
        }

        public async Task<Unit> Handle(ActivateWBSVersionCommand request, CancellationToken cancellationToken)
        {
            try
            {
                var success = await _wbsVersionRepository.ActivateVersionAsync(request.ProjectId, request.Version);
                
                if (!success)
                {
                    throw new System.InvalidOperationException($"Failed to activate WBS version {request.Version} for project {request.ProjectId}");
                }

                _logger.LogInformation($"Activated WBS version {request.Version} for project {request.ProjectId}");

                return Unit.Value;
            }
            catch (System.Exception ex)
            {
                _logger.LogError(ex, $"Error activating WBS version {request.Version} for project {request.ProjectId}");
                throw;
            }
        }
    }
} 
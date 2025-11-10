using MediatR;
using Microsoft.Extensions.Logging;
using NJS.Application.CQRS.WorkBreakdownStructures.Commands;
using NJS.Repositories.Interfaces;
using System.Threading;
using System.Threading.Tasks;

namespace NJS.Application.CQRS.WorkBreakdownStructures.Handlers
{
    public class DeleteWBSVersionCommandHandler : IRequestHandler<DeleteWBSVersionCommand, Unit>
    {
        private readonly IWBSVersionRepository _wbsVersionRepository;
        private readonly ILogger<DeleteWBSVersionCommandHandler> _logger;

        public DeleteWBSVersionCommandHandler(
            IWBSVersionRepository wbsVersionRepository,
            ILogger<DeleteWBSVersionCommandHandler> logger)
        {
            _wbsVersionRepository = wbsVersionRepository;
            _logger = logger;
        }

        public async Task<Unit> Handle(DeleteWBSVersionCommand request, CancellationToken cancellationToken)
        {
            try
            {
                var success = await _wbsVersionRepository.DeleteVersionAsync(request.ProjectId, request.Version);
                
                if (!success)
                {
                    throw new System.InvalidOperationException($"Failed to delete WBS version {request.Version} for project {request.ProjectId}");
                }

                _logger.LogInformation($"Deleted WBS version {request.Version} for project {request.ProjectId}");

                return Unit.Value;
            }
            catch (System.Exception ex)
            {
                _logger.LogError(ex, $"Error deleting WBS version {request.Version} for project {request.ProjectId}");
                throw;
            }
        }
    }
} 
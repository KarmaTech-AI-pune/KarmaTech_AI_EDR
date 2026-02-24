using MediatR;
using Microsoft.Extensions.Logging;
using EDR.Application.CQRS.Permissions.Commands;
using EDR.Repositories.Interfaces;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace EDR.Application.CQRS.Permissions.Handlers
{
    public class DeletePermissionCommandHandler : IRequestHandler<DeletePermissionCommand, bool>
    {
        private readonly IPermissionRepository _permissionRepository;
        private readonly ILogger<DeletePermissionCommandHandler> _logger;

        public DeletePermissionCommandHandler(IPermissionRepository permissionRepository, ILogger<DeletePermissionCommandHandler> logger)
        {
            _permissionRepository = permissionRepository ?? throw new ArgumentNullException(nameof(permissionRepository));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<bool> Handle(DeletePermissionCommand request, CancellationToken cancellationToken)
        {
            if (request.Id <= 0)
            {
                _logger.LogWarning($"DeletePermissionCommand received an invalid Id: {request.Id}.");
                throw new ArgumentException("Invalid Id provided for deletion.");
            }

            try
            {
                // First, check if the permission exists
                var permissionToDelete = await _permissionRepository.GetByIdAsync(request.Id);
                if (permissionToDelete == null)
                {
                    _logger.LogWarning($"Permission with ID {request.Id} not found for deletion.");
                    // Depending on requirements, you might throw an exception or return false/true.
                    // Returning true here to indicate the desired state (permission is gone) is achieved.
                    return true; 
                }

                await _permissionRepository.DeleteAsync(request.Id);
                _logger.LogInformation($"Permission with ID {request.Id} deleted successfully.");
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting permission with ID {PermissionId}", request.Id);
                // Rethrow the exception to be handled by global exception handling middleware
                throw;
            }
        }
    }
}


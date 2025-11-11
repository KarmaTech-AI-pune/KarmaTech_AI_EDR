using MediatR;
using Microsoft.Extensions.Logging;
using NJS.Application.CQRS.Permissions.Commands;
using NJS.Repositories.Interfaces;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace NJS.Application.CQRS.Permissions.Handlers
{
    public class UpdatePermissionCommandHandler : IRequestHandler<UpdatePermissionCommand, bool>
    {
        private readonly IPermissionRepository _permissionRepository;
        private readonly ILogger<UpdatePermissionCommandHandler> _logger;

        public UpdatePermissionCommandHandler(IPermissionRepository permissionRepository, ILogger<UpdatePermissionCommandHandler> logger)
        {
            _permissionRepository = permissionRepository ?? throw new ArgumentNullException(nameof(permissionRepository));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<bool> Handle(UpdatePermissionCommand request, CancellationToken cancellationToken)
        {
            if (request.PermissionDto == null)
            {
                _logger.LogError("UpdatePermissionCommand received null PermissionDto.");
                throw new ArgumentNullException(nameof(request.PermissionDto));
            }

            if (request.PermissionDto.Id == 0) // Assuming 0 is not a valid ID and indicates it wasn't provided or is invalid
            {
                _logger.LogWarning("UpdatePermissionCommand received a PermissionDto with an invalid or missing Id.");
                throw new ArgumentException("Permission Id is required for update operations.");
            }

            // Check if a permission with the same name (excluding the current one) already exists
            var existingPermissionByName = await _permissionRepository.GetByNameAsync(request.PermissionDto.Name);
            if (existingPermissionByName != null && existingPermissionByName.Id != request.PermissionDto.Id)
            {
                _logger.LogWarning($"Permission with name '{request.PermissionDto.Name}' already exists for another ID.");
                throw new ArgumentException($"Permission with name '{request.PermissionDto.Name}' already exists.");
            }

            var permission = await _permissionRepository.GetByIdAsync(request.PermissionDto.Id);
            if (permission == null)
            {
                _logger.LogWarning($"Permission with ID {request.PermissionDto.Id} not found for update.");
                throw new ArgumentException($"Permission with ID {request.PermissionDto.Id} not found.");
            }

            // Update properties
            permission.Name = request.PermissionDto.Name;
            permission.Description = request.PermissionDto.Description;
            permission.Category = request.PermissionDto.Category;

            try
            {
                await _permissionRepository.UpdateAsync(permission);
                _logger.LogInformation($"Permission with ID {permission.Id} updated successfully.");
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating permission with ID {PermissionId}", permission.Id);
                // Rethrow the exception to be handled by global exception handling middleware
                throw;
            }
        }
    }
}

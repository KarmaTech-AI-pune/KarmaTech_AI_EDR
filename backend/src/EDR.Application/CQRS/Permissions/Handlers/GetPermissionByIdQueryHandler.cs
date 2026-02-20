using MediatR;
using Microsoft.Extensions.Logging;
using EDR.Application.CQRS.Permissions.Queries;
using EDR.Application.Dtos;
using EDR.Repositories.Interfaces;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace EDR.Application.CQRS.Permissions.Handlers
{
    public class GetPermissionByIdQueryHandler : IRequestHandler<GetPermissionByIdQuery, PermissionDto?>
    {
        private readonly IPermissionRepository _permissionRepository;
        private readonly ILogger<GetPermissionByIdQueryHandler> _logger;

        public GetPermissionByIdQueryHandler(IPermissionRepository permissionRepository, ILogger<GetPermissionByIdQueryHandler> logger)
        {
            _permissionRepository = permissionRepository ?? throw new ArgumentNullException(nameof(permissionRepository));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<PermissionDto?> Handle(GetPermissionByIdQuery request, CancellationToken cancellationToken)
        {
            if (request.Id <= 0)
            {
                _logger.LogWarning($"GetPermissionByIdQuery received an invalid Id: {request.Id}.");
                // Return null or throw an exception based on desired behavior for invalid ID
                return null; 
            }

            try
            {
                var permission = await _permissionRepository.GetByIdAsync(request.Id);

                if (permission == null)
                {
                    _logger.LogWarning($"Permission with ID {request.Id} not found.");
                    return null; // Permission not found
                }

                // Map the domain entity to a DTO
                var permissionDto = new PermissionDto
                {
                    Id = permission.Id,
                    Name = permission.Name,
                    Description = permission.Description,
                    Category = permission.Category
                };

                _logger.LogInformation($"Permission with ID {request.Id} retrieved successfully.");
                return permissionDto;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving permission with ID {PermissionId}", request.Id);
                // Rethrow the exception to be handled by global exception handling middleware
                throw;
            }
        }
    }
}


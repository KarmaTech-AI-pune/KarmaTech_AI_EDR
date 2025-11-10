using MediatR;
using Microsoft.Extensions.Logging;
using NJS.Application.CQRS.Permissions.Queries;
using NJS.Application.Dtos;
using NJS.Repositories.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace NJS.Application.CQRS.Permissions.Handlers
{
    public class GetAllPermissionsQueryHandler : IRequestHandler<GetAllPermissionsQuery, IEnumerable<PermissionDto>>
    {
        private readonly IPermissionRepository _permissionRepository;
        private readonly ILogger<GetAllPermissionsQueryHandler> _logger;

        public GetAllPermissionsQueryHandler(IPermissionRepository permissionRepository, ILogger<GetAllPermissionsQueryHandler> logger)
        {
            _permissionRepository = permissionRepository ?? throw new ArgumentNullException(nameof(permissionRepository));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<IEnumerable<PermissionDto>> Handle(GetAllPermissionsQuery request, CancellationToken cancellationToken)
        {
            try
            {
                var permissions = await _permissionRepository.GetAllAsync();

                if (permissions == null || !permissions.Any())
                {
                    _logger.LogInformation("No permissions found.");
                    return new List<PermissionDto>(); // Return empty list if no permissions found
                }

                // Map the domain entities to DTOs
                var permissionDtos = permissions.Select(p => new PermissionDto
                {
                    Id = p.Id,
                    Name = p.Name,
                    Description = p.Description,
                    Category = p.Category
                }).ToList();

                _logger.LogInformation($"Retrieved {permissionDtos.Count} permissions.");
                return permissionDtos;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving all permissions.");
                // Rethrow the exception to be handled by global exception handling middleware
                throw;
            }
        }
    }
}

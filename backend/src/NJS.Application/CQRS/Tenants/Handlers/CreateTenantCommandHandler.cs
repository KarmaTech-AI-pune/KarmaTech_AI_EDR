using MediatR;
using NJS.Application.CQRS.Tenants.Commands;
using NJS.Application.Dtos;
using NJS.Domain.Entities;
using NJS.Repositories.Interfaces;
using System.Threading;
using System.Threading.Tasks;

namespace NJS.Application.CQRS.Tenants.Handlers
{
    public class CreateTenantCommandHandler : IRequestHandler<CreateTenantCommand, TenantDto>
    {
        private readonly ITenantRepository _tenantRepository;

        public CreateTenantCommandHandler(ITenantRepository tenantRepository)
        {
            _tenantRepository = tenantRepository;
        }

        public async Task<TenantDto> Handle(CreateTenantCommand request, CancellationToken cancellationToken)
        {
            var tenant = new Tenant
            {
                Name = request.Name,
                Domain = request.Domain
            };

            var createdTenant = await _tenantRepository.CreateAsync(tenant);

            return new TenantDto
            {
                Id = createdTenant.Id,
                Name = createdTenant.Name,
                Domain = createdTenant.Domain
            };
        }
    }
}

using MediatR;
using EDR.Application.CQRS.Tenants.Commands;
using EDR.Application.Dtos;
using EDR.Domain.Entities;
using EDR.Repositories.Interfaces;
using System.Threading;
using System.Threading.Tasks;

namespace EDR.Application.CQRS.Tenants.Handlers
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


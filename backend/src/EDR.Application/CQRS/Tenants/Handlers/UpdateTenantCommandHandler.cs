using MediatR;
using EDR.Application.CQRS.Tenants.Commands;
using EDR.Application.Dtos;
using EDR.Domain.Entities;
using EDR.Repositories.Interfaces;
using System.Threading;
using System.Threading.Tasks;

namespace EDR.Application.CQRS.Tenants.Handlers
{
    public class UpdateTenantCommandHandler : IRequestHandler<UpdateTenantCommand, TenantDto>
    {
        private readonly ITenantRepository _tenantRepository;

        public UpdateTenantCommandHandler(ITenantRepository tenantRepository)
        {
            _tenantRepository = tenantRepository;
        }

        public async Task<TenantDto> Handle(UpdateTenantCommand request, CancellationToken cancellationToken)
        {
            var tenant = await _tenantRepository.GetByIdAsync(request.Id);

            if (tenant == null)
            {
                return null;
            }

            tenant.Name = request.Name;
            tenant.Domain = request.Domain;

            await _tenantRepository.UpdateAsync(tenant);

            return new TenantDto
            {
                Id = tenant.Id,
                Name = tenant.Name,
                Domain = tenant.Domain
            };
        }
    }
}


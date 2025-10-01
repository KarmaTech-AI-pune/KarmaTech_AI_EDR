using MediatR;
using NJS.Application.CQRS.Tenants.Commands;
using NJS.Application.Dtos;
using NJS.Domain.Entities;
using NJS.Repositories.Interfaces;
using System.Threading;
using System.Threading.Tasks;

namespace NJS.Application.CQRS.Tenants.Handlers
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

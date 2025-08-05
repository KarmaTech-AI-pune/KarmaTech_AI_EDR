using MediatR;
using NJS.Application.CQRS.Tenants.Queries;
using NJS.Application.Dtos;
using NJS.Repositories.Interfaces;
using System.Threading;
using System.Threading.Tasks;

namespace NJS.Application.CQRS.Tenants.Handlers
{
    public class GetTenantByIdQueryHandler : IRequestHandler<GetTenantByIdQuery, TenantDto>
    {
        private readonly ITenantRepository _tenantRepository;

        public GetTenantByIdQueryHandler(ITenantRepository tenantRepository)
        {
            _tenantRepository = tenantRepository;
        }

        public async Task<TenantDto> Handle(GetTenantByIdQuery request, CancellationToken cancellationToken)
        {
            var tenant = await _tenantRepository.GetByIdAsync(request.Id);

            if (tenant == null)
            {
                return null;
            }

            return new TenantDto
            {
                Id = tenant.Id,
                Name = tenant.Name,
                Domain = tenant.Domain
            };
        }
    }
}

using MediatR;
using NJS.Application.CQRS.Tenants.Queries;
using NJS.Application.Dtos;
using NJS.Repositories.Interfaces;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace NJS.Application.CQRS.Tenants.Handlers
{
    public class GetAllTenantsQueryHandler : IRequestHandler<GetAllTenantsQuery, IEnumerable<TenantDto>>
    {
        private readonly ITenantRepository _tenantRepository;

        public GetAllTenantsQueryHandler(ITenantRepository tenantRepository)
        {
            _tenantRepository = tenantRepository;
        }

        public async Task<IEnumerable<TenantDto>> Handle(GetAllTenantsQuery request, CancellationToken cancellationToken)
        {
            var tenants = await _tenantRepository.GetAllAsync();
            return tenants.Select(t => new TenantDto
            {
                Id = t.Id,
                Name = t.Name,
                Domain = t.Domain
            });
        }
    }
}

using MediatR;
using NJS.Application.Dtos;
using System.Collections.Generic;

namespace NJS.Application.CQRS.Tenants.Queries
{
    public class GetTenantFeaturesQuery : IRequest<TenantPlanDetailsDto>
    {
        public int TenantId { get; set; }

        public GetTenantFeaturesQuery(int tenantId)
        {
            TenantId = tenantId;
        }
    }
}

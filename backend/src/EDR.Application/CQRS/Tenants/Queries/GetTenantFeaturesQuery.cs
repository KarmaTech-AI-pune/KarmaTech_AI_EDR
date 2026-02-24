using MediatR;
using EDR.Application.Dtos;
using System.Collections.Generic;

namespace EDR.Application.CQRS.Tenants.Queries
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


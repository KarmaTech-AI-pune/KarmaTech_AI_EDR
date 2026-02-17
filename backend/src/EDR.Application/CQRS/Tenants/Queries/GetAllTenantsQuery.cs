using MediatR;
using EDR.Application.Dtos;
using System.Collections.Generic;

namespace EDR.Application.CQRS.Tenants.Queries
{
    public class GetAllTenantsQuery : IRequest<IEnumerable<TenantDto>>
    {
    }
}


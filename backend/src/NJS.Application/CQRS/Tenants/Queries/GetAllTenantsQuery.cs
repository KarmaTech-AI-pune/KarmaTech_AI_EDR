using MediatR;
using NJS.Application.Dtos;
using System.Collections.Generic;

namespace NJS.Application.CQRS.Tenants.Queries
{
    public class GetAllTenantsQuery : IRequest<IEnumerable<TenantDto>>
    {
    }
}

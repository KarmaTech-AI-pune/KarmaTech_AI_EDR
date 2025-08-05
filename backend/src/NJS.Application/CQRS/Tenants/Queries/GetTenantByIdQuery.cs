using MediatR;
using NJS.Application.Dtos;

namespace NJS.Application.CQRS.Tenants.Queries
{
    public class GetTenantByIdQuery : IRequest<TenantDto>
    {
        public int Id { get; set; }
    }
}

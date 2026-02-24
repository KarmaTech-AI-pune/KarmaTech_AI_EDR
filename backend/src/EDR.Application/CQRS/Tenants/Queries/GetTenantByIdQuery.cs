using MediatR;
using EDR.Application.Dtos;

namespace EDR.Application.CQRS.Tenants.Queries
{
    public class GetTenantByIdQuery : IRequest<TenantDto>
    {
        public int Id { get; set; }
    }
}


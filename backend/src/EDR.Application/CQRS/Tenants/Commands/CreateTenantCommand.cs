using MediatR;
using EDR.Application.Dtos;

namespace EDR.Application.CQRS.Tenants.Commands
{
    public class CreateTenantCommand : IRequest<TenantDto>
    {
        public string Name { get; set; }
        public string Domain { get; set; }
    }
}


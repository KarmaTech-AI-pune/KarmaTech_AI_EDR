using MediatR;
using EDR.Application.Dtos;

namespace EDR.Application.CQRS.Tenants.Commands
{
    public class UpdateTenantCommand : IRequest<TenantDto>
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Domain { get; set; }
    }
}


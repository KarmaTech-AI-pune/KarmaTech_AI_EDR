using MediatR;
using NJS.Application.Dtos;

namespace NJS.Application.CQRS.Tenants.Commands
{
    public class CreateTenantCommand : IRequest<TenantDto>
    {
        public string Name { get; set; }
        public string Domain { get; set; }
    }
}

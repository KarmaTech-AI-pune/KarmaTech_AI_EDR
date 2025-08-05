using MediatR;
using NJS.Application.Dtos;

namespace NJS.Application.CQRS.Tenants.Commands
{
    public class UpdateTenantCommand : IRequest<TenantDto>
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Domain { get; set; }
    }
}

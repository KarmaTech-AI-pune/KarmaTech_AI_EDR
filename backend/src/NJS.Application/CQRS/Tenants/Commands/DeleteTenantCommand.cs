using MediatR;

namespace NJS.Application.CQRS.Tenants.Commands
{
    public class DeleteTenantCommand : IRequest
    {
        public int Id { get; set; }
    }
}

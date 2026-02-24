using MediatR;

namespace EDR.Application.CQRS.Tenants.Commands
{
    public class DeleteTenantCommand : IRequest
    {
        public int Id { get; set; }
    }
}


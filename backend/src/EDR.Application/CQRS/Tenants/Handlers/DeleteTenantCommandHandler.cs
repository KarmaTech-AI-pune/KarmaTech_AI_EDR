using MediatR;
using EDR.Application.CQRS.Tenants.Commands;
using EDR.Repositories.Interfaces;
using System.Threading;
using System.Threading.Tasks;

namespace EDR.Application.CQRS.Tenants.Handlers
{
    public class DeleteTenantCommandHandler : IRequestHandler<DeleteTenantCommand>
    {
        private readonly ITenantRepository _tenantRepository;

        public DeleteTenantCommandHandler(ITenantRepository tenantRepository)
        {
            _tenantRepository = tenantRepository;
        }

        public async Task Handle(DeleteTenantCommand request, CancellationToken cancellationToken)
        {
            await _tenantRepository.DeleteAsync(request.Id);
        }
    }
}


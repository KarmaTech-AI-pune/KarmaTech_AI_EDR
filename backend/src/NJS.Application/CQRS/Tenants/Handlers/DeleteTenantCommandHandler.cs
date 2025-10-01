using MediatR;
using NJS.Application.CQRS.Tenants.Commands;
using NJS.Repositories.Interfaces;
using System.Threading;
using System.Threading.Tasks;

namespace NJS.Application.CQRS.Tenants.Handlers
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

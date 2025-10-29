using MediatR;
using NJS.Application.CQRS.WorkBreakdownStructures.Commands;
using NJS.Repositories.Interfaces;
using System.Threading;
using System.Threading.Tasks;

namespace NJS.Application.CQRS.WorkBreakdownStructures.Handlers
{
    public class DeleteWBSOptionCommandHandler : IRequestHandler<DeleteWBSOptionCommand, bool>
    {
        private readonly IWBSOptionRepository _wbsOptionRepository;

        public DeleteWBSOptionCommandHandler(IWBSOptionRepository wbsOptionRepository)
        {
            _wbsOptionRepository = wbsOptionRepository;
        }

        public async Task<bool> Handle(DeleteWBSOptionCommand request, CancellationToken cancellationToken)
        {
            return await _wbsOptionRepository.DeleteAsync(request.Id);
        }
    }
}

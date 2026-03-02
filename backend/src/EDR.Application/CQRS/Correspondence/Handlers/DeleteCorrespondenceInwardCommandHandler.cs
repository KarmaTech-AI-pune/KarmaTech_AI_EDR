using MediatR;
using EDR.Application.CQRS.Correspondence.Commands;
using EDR.Repositories.Interfaces;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace EDR.Application.CQRS.Correspondence.Handlers
{
    public class DeleteCorrespondenceInwardCommandHandler : IRequestHandler<DeleteCorrespondenceInwardCommand, bool>
    {
        private readonly ICorrespondenceInwardRepository _repository;

        public DeleteCorrespondenceInwardCommandHandler(ICorrespondenceInwardRepository repository)
        {
            _repository = repository ?? throw new ArgumentNullException(nameof(repository));
        }

        public async Task<bool> Handle(DeleteCorrespondenceInwardCommand request, CancellationToken cancellationToken)
        {
            var exists = await _repository.ExistsAsync(request.Id);
            if (!exists)
            {
                return false;
            }

            await _repository.DeleteAsync(request.Id);

            // Reset the identity seed to ensure new entries start from the lowest available ID
            await _repository.ResetIdentitySeedAsync();

            return true;
        }
    }
}


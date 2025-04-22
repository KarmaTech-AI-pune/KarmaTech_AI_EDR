using MediatR;
using NJS.Application.CQRS.Correspondence.Commands;
using NJS.Repositories.Interfaces;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace NJS.Application.CQRS.Correspondence.Handlers
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
            return true;
        }
    }
}

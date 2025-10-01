using MediatR;
using NJS.Application.CQRS.Correspondence.Commands;
using NJS.Repositories.Interfaces;

namespace NJS.Application.CQRS.Correspondence.Handlers
{
    public class DeleteCorrespondenceOutwardCommandHandler(ICorrespondenceOutwardRepository repository)
        : IRequestHandler<DeleteCorrespondenceOutwardCommand, bool>
    {
        private readonly ICorrespondenceOutwardRepository _repository = repository ?? throw new ArgumentNullException(nameof(repository));

        public async Task<bool> Handle(DeleteCorrespondenceOutwardCommand request, CancellationToken cancellationToken)
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

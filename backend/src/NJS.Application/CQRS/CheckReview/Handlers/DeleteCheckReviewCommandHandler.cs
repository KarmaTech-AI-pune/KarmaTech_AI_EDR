using MediatR;
using NJS.Application.CQRS.CheckReview.Commands;
using NJS.Repositories.Interfaces;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace NJS.Application.CQRS.CheckReview.Handlers
{
    public class DeleteCheckReviewCommandHandler : IRequestHandler<DeleteCheckReviewCommand, bool>
    {
        private readonly ICheckReviewRepository _repository;

        public DeleteCheckReviewCommandHandler(ICheckReviewRepository repository)
        {
            _repository = repository ?? throw new ArgumentNullException(nameof(repository));
        }

        public async Task<bool> Handle(DeleteCheckReviewCommand request, CancellationToken cancellationToken)
        {
            try
            {
                await _repository.DeleteAsync(request.Id);
                return true;
            }
            catch (KeyNotFoundException)
            {
                // Item not found, return false
                return false;
            }
            catch (Exception)
            {
                // Any other exception, rethrow
                throw;
            }
        }
    }
}

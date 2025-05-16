using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NJS.Application.CQRS.CheckReview.Commands;
using NJS.Domain.Database;

namespace NJS.Application.CQRS.CheckReview.Handlers
{
    public class DeleteCheckReviewCommandHandler : IRequestHandler<DeleteCheckReviewCommand, bool>
    {
        private readonly ProjectManagementContext _context;

        public DeleteCheckReviewCommandHandler(ProjectManagementContext context)
        {
            _context = context;
        }

        public async Task<bool> Handle(DeleteCheckReviewCommand request, CancellationToken cancellationToken)
        {
            var checkReview = await _context.CheckReviews
                .FirstOrDefaultAsync(cr => cr.Id == request.Id, cancellationToken);

            if (checkReview == null)
            {
                return false;
            }

            _context.CheckReviews.Remove(checkReview);
            await _context.SaveChangesAsync(cancellationToken);

            return true;
        }
    }
}

using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NJS.Application.CQRS.Commands.BidPreparation;
using NJS.Domain.Database;
using NJS.Domain.Entities;

namespace NJS.Application.CQRS.Handlers.BidPreparation
{
    public class ApproveBidPreparationCommandHandler : IRequestHandler<ApproveBidPreparationCommand, bool>
    {
        private readonly ProjectManagementContext _context;

        public ApproveBidPreparationCommandHandler(ProjectManagementContext context)
        {
            _context = context;
        }

        public async Task<bool> Handle(ApproveBidPreparationCommand request, CancellationToken cancellationToken)
        {
            var bidPreparation = await _context.BidPreparations
                    .Include(b => b.VersionHistory)
                    .OrderByDescending(b => b.CreatedAt)
                    .FirstOrDefaultAsync(b => b.OpportunityId == request.OpportunityId
                    && (b.UserId == request.UserId
                       || b.RegionalMangerId==request.UserId
                       || b.RegionalDirectorId==request.UserId), cancellationToken);

            if (bidPreparation == null || bidPreparation.Status != BidPreparationStatus.PendingApproval)
                return false;

            // Create version history entry
            var versionHistory = new BidVersionHistory
            {
                BidPreparationId = bidPreparation.Id,
                Version = bidPreparation.Version + 1,
                DocumentCategoriesJson = bidPreparation.DocumentCategoriesJson,
                Status = request.IsApproved ? BidPreparationStatus.Approved : BidPreparationStatus.Rejected,
                
                Comments = request.Comments,
                ModifiedBy = request.CreatedBy,
                ModifiedDate = DateTime.UtcNow
            };

            // Update bid preparation
            bidPreparation.Status = request.IsApproved ? BidPreparationStatus.Approved : BidPreparationStatus.Rejected;
            bidPreparation.Version = versionHistory.Version;
            bidPreparation.Comments = request.Comments;
            bidPreparation.UpdatedBy = request.CreatedBy;
            bidPreparation.UpdatedAt = DateTime.UtcNow;

            _context.BidVersionHistories.Add(versionHistory);
            await _context.SaveChangesAsync(cancellationToken);

            return true;
        }
    }
}

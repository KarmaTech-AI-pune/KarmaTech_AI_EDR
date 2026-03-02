using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using EDR.Application.CQRS.Commands.BidPreparation;
using EDR.Domain.Database;
using EDR.Domain.Entities;

namespace EDR.Application.CQRS.Handlers.BidPreparation
{
    public class SubmitBidPreparationCommandHandler : IRequestHandler<SubmitBidPreparationCommand, bool>
    {
        private readonly ProjectManagementContext _context;

        public SubmitBidPreparationCommandHandler(ProjectManagementContext context)
        {
            _context = context;
        }

        public async Task<bool> Handle(SubmitBidPreparationCommand request, CancellationToken cancellationToken)
        {
            //BDM submit to Bid to RM
            var bidPreparation = await _context.BidPreparations                   
                    .OrderByDescending(b => b.CreatedAt)
                    .FirstOrDefaultAsync(b => b.OpportunityId == request.OpportunityId
                    && (b.UserId == request.UserId
                    || b.RegionalMangerId == request.UserId
                    || b.RegionalDirectorId == request.UserId), cancellationToken);

          
            if (bidPreparation == null)
                return false;

            // Create version history entry
            var versionHistory = new BidVersionHistory
            {
                BidPreparationId = bidPreparation.Id,
                Version = bidPreparation.Version + 1,
                DocumentCategoriesJson = bidPreparation.DocumentCategoriesJson,
                Status = BidPreparationStatus.PendingApproval,                
                Comments = "Submitted for approval",
                ModifiedBy = request.CreatedBy,
                ModifiedDate = DateTime.UtcNow,
                
            };

            // Update bid preparation
            bidPreparation.Status = BidPreparationStatus.PendingApproval;
            bidPreparation.Version = versionHistory.Version;
            bidPreparation.UpdatedBy = request.CreatedBy;
            bidPreparation.UpdatedAt = DateTime.UtcNow;
            bidPreparation.CreatedBy = request.CreatedBy;

            _context.BidVersionHistories.Add(versionHistory);
            await _context.SaveChangesAsync(cancellationToken);

            return true;
        }
    }
}


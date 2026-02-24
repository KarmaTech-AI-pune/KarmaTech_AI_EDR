using MediatR;
using Microsoft.EntityFrameworkCore;
using EDR.Application.CQRS.Commands.BidPreparation;
using EDR.Domain.Database;
using EDR.Domain.Entities;

namespace EDR.Application.CQRS.Handlers.BidPreparation
{
    public class UpdateBidPreparationCommandHandler : IRequestHandler<UpdateBidPreparationCommand, bool>
    {
        private readonly ProjectManagementContext _context;


        public UpdateBidPreparationCommandHandler(ProjectManagementContext context)
        {
            _context = context;
        }

        public async Task<bool> Handle(UpdateBidPreparationCommand request, CancellationToken cancellationToken)
        {
            try
            {
                var bidPreparation = await _context.BidPreparations
                    .Include(b => b.VersionHistory)
                    .OrderByDescending(b => b.CreatedAt)
                    .FirstOrDefaultAsync(b => b.OpportunityId == request.OpportunityId
                    && (b.UserId == request.UserId
                      || b.RegionalMangerId == request.UserId
                      || b.RegionalDirectorId==request.UserId), cancellationToken);
                     


                var now = DateTime.UtcNow;

                if (bidPreparation == null)
                {
                    var opportunity = await _context.OpportunityTrackings.FirstOrDefaultAsync(x => x.Id == request.OpportunityId, cancellationToken: cancellationToken);

                    bidPreparation = new Domain.Entities.BidPreparation
                    {
                        UserId = request.UserId,
                        DocumentCategoriesJson = request.DocumentCategoriesJson,
                        OpportunityId = request.OpportunityId,
                        Status = BidPreparationStatus.Draft,
                        Version = 1,
                        Comments = request.Comments,
                        CreatedDate = now,
                        ModifiedDate = now,
                        CreatedAt = now,
                        UpdatedAt = now,
                        CreatedBy = request.CreatedBy,
                        UpdatedBy = request.CreatedBy,
                        RegionalDirectorId = opportunity?.ApprovalManagerId,
                        RegionalMangerId = opportunity?.ReviewManagerId,

                    };
                    var versionHistory = new BidVersionHistory
                    {
                        Version = 1,
                        DocumentCategoriesJson = request.DocumentCategoriesJson,
                        Status = BidPreparationStatus.Draft,
                        Comments = request.Comments,
                        ModifiedBy = request.CreatedBy,
                        ModifiedDate = now
                    };
                    bidPreparation.VersionHistory.Add(versionHistory);
                    _context.BidPreparations.Add(bidPreparation);
                }
                else
                {
                    // Only allow updates if status is Draft
                    if (bidPreparation.Status != BidPreparationStatus.Draft)
                        return false;

                    // Create version history entry
                    var versionHistory = new BidVersionHistory
                    {
                        BidPreparationId = bidPreparation.Id,
                        Version = bidPreparation.Version + 1,
                        DocumentCategoriesJson = request.DocumentCategoriesJson,
                        Status = BidPreparationStatus.Draft,
                        Comments = request.Comments,
                        ModifiedBy = request.CreatedBy,
                        ModifiedDate = now
                    };

                    bidPreparation.DocumentCategoriesJson = request.DocumentCategoriesJson;
                    bidPreparation.Comments = request.Comments;
                    bidPreparation.Version = versionHistory.Version;
                    bidPreparation.ModifiedDate = now;
                    bidPreparation.UpdatedAt = now;
                    bidPreparation.UpdatedBy = request.CreatedBy;

                    _context.BidVersionHistories.Add(versionHistory);
                }

                await _context.SaveChangesAsync(cancellationToken);
                return true;
            }
            catch (Exception)
            {
                return false;
            }
        }
    }
}


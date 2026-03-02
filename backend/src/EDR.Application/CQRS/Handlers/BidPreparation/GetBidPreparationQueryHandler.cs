using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using EDR.Application.CQRS.Queries.BidPreparation;
using EDR.Application.Dtos;
using EDR.Domain.Database;

namespace EDR.Application.CQRS.Handlers.BidPreparation
{
    public class GetBidPreparationQueryHandler : IRequestHandler<GetBidPreparationQuery, BidPreparationDto>
    {
        private readonly ProjectManagementContext _context;

        public GetBidPreparationQueryHandler(ProjectManagementContext context)
        {
            _context = context;
        }

        public async Task<BidPreparationDto> Handle(GetBidPreparationQuery request, CancellationToken cancellationToken)
        {
            var bidPreparation = await _context.BidPreparations
                 .Where(b => b.OpportunityId == request.OpportunityId
                 && (b.UserId == request.UserId 
                  || b.RegionalMangerId == request.UserId
                  || b.RegionalDirectorId == request.UserId))
                 .OrderByDescending(b => b.CreatedAt)
                 .Include(b => b.VersionHistory)
                 .FirstOrDefaultAsync(cancellationToken);

            if (bidPreparation == null)
            {
                return null;
            }

            return new BidPreparationDto
            {
                Id = bidPreparation.Id,
                DocumentCategoriesJson = bidPreparation.DocumentCategoriesJson,
                OpportunityId = bidPreparation.OpportunityId,
                UserId = bidPreparation.UserId,
                Version = bidPreparation.Version,
                Status = bidPreparation.Status,
                Comments = bidPreparation.Comments,
                CreatedDate = bidPreparation.CreatedDate,
                ModifiedDate = bidPreparation.ModifiedDate,
                CreatedAt = bidPreparation.CreatedAt,
                UpdatedAt = bidPreparation.UpdatedAt,
                CreatedBy = bidPreparation.CreatedBy,
                UpdatedBy = bidPreparation.UpdatedBy,
                VersionHistory = bidPreparation.VersionHistory
                    .OrderByDescending(v => v.Version)
                    .Select(v => new BidVersionHistoryDto
                    {
                        Id = v.Id,
                        BidPreparationId = v.BidPreparationId,
                        Version = v.Version,
                        DocumentCategoriesJson = v.DocumentCategoriesJson,
                        Status = v.Status,
                        Comments = v.Comments,
                        ModifiedBy = v.ModifiedBy,
                        ModifiedDate = v.ModifiedDate
                    })
                    .ToList()
            };
        }
    }
}


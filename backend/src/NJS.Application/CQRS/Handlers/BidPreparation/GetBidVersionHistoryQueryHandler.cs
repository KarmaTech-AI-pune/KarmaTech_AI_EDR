using MediatR;
using Microsoft.EntityFrameworkCore;
using NJS.Application.CQRS.Queries.BidPreparation;
using NJS.Application.Dtos;
using NJS.Domain.Database;
using NJS.Domain.Entities;

namespace NJS.Application.CQRS.Handlers.BidPreparation
{
    public class GetBidVersionHistoryQueryHandler : IRequestHandler<GetBidVersionHistoryQuery, List<BidVersionHistoryDto>>
    {
        private readonly ProjectManagementContext _context;

        public GetBidVersionHistoryQueryHandler(ProjectManagementContext context)
        {
            _context = context;
        }

        public async Task<List<BidVersionHistoryDto>> Handle(GetBidVersionHistoryQuery request, CancellationToken cancellationToken)
        {

            var bidPreparation = await _context.BidPreparations
                .Include(x => x.VersionHistory)
                   .OrderByDescending(b => b.CreatedAt)
                   .FirstOrDefaultAsync(b => b.OpportunityId == request.OpportunityId
                   && (b.UserId == request.UserId
                   || b.RegionalMangerId == request.UserId
                   || b.RegionalDirectorId == request.UserId), cancellationToken);

            if (bidPreparation == null)
            {
                return [];
            }
            var result = bidPreparation.VersionHistory.OrderByDescending(b => b.Version)
                .Select(b => new BidVersionHistoryDto
                {
                    Id = b.Id,
                    BidPreparationId = b.BidPreparationId,
                    Version = b.Version,
                    DocumentCategoriesJson = b.DocumentCategoriesJson,
                    Status = b.Status,
                    Comments = b.Comments,
                    ModifiedBy = b.ModifiedBy,
                    ModifiedDate = b.ModifiedDate
                }).ToList();


            return result;

            //var history = await _context.BidVersionHistories
            //    .Where(b => b.BidPreparation.OpportunityId == request.OpportunityId )
            //    .OrderByDescending(b => b.Version)
            //    .Select(b => new BidVersionHistoryDto
            //    {
            //        Id = b.Id,
            //        BidPreparationId = b.BidPreparationId,
            //        Version = b.Version,
            //        DocumentCategoriesJson = b.DocumentCategoriesJson,
            //        Status = b.Status,                    
            //        Comments = b.Comments,
            //        ModifiedBy = b.ModifiedBy,
            //        ModifiedDate = b.ModifiedDate
            //    })
            //    .ToListAsync(cancellationToken);

            //return history;
        }
    }
}

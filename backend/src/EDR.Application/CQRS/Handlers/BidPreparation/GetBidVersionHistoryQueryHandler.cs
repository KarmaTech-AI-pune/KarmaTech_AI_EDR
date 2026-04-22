using MediatR;
using Microsoft.EntityFrameworkCore;
using EDR.Application.CQRS.Queries.BidPreparation;
using EDR.Application.Dtos;
using EDR.Domain.Database;
using EDR.Domain.Entities;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace EDR.Application.CQRS.Handlers.BidPreparation
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
                .FirstOrDefaultAsync(b => b.OpportunityId == request.OpportunityId, cancellationToken);

            if (bidPreparation == null)
            {
                return new List<BidVersionHistoryDto>();
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
        }
    }
}

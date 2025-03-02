using System.Threading;
using System.Threading.Tasks;
using MediatR;
using NJS.Application.CQRS.Queries.BidPreparation;
using NJS.Application.Dtos;
using NJS.Repositories.Interfaces;
using NJS.Domain.Entities;

namespace NJS.Application.CQRS.Handlers.BidPreparation
{
    public class GetBidPreparationQueryHandler : IRequestHandler<GetBidPreparationQuery, BidPreparationDto>
    {
        private readonly IBidPreparationRepository _bidPreparationRepository;

        public GetBidPreparationQueryHandler(IBidPreparationRepository bidPreparationRepository)
        {
            _bidPreparationRepository = bidPreparationRepository;
        }

        public async Task<BidPreparationDto> Handle(GetBidPreparationQuery request, CancellationToken cancellationToken)
        {
            var bidPreparation = await _bidPreparationRepository.GetByUserIdAsync(request.UserId);

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
                CreatedDate = bidPreparation.CreatedDate,
                ModifiedDate = bidPreparation.ModifiedDate,
                CreatedAt = bidPreparation.CreatedAt,
                UpdatedAt = bidPreparation.UpdatedAt,
                CreatedBy = bidPreparation.CreatedBy,
                UpdatedBy = bidPreparation.UpdatedBy
            };
        }
    }
}

using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using NJS.Application.CQRS.Commands.BidPreparation;
using NJS.Domain.UnitWork;
using NJS.Repositories.Interfaces;
using NJS.Domain.Entities;

namespace NJS.Application.CQRS.Handlers.BidPreparation
{
    public class UpdateBidPreparationCommandHandler : IRequestHandler<UpdateBidPreparationCommand, bool>
    {
        private readonly IBidPreparationRepository _bidPreparationRepository;

        public UpdateBidPreparationCommandHandler(IBidPreparationRepository bidPreparationRepository)
        {
            _bidPreparationRepository = bidPreparationRepository;
        }

        public async Task<bool> Handle(UpdateBidPreparationCommand request, CancellationToken cancellationToken)
        {
            try
            {
                var bidPreparation = await _bidPreparationRepository.GetByUserIdAsync(request.UserId);
                var now = DateTime.UtcNow;

                if (bidPreparation == null)
                {
                    bidPreparation = new Domain.Entities.BidPreparation
                    {
                        UserId = request.UserId,
                        DocumentCategoriesJson = request.DocumentCategoriesJson,
                        OpportunityId = request.OpportunityId,
                        CreatedDate = now,
                        ModifiedDate = now,
                        CreatedAt = now,
                        UpdatedAt = now,
                        CreatedBy = request.UserId,
                        UpdatedBy = request.UserId
                    };
                    await _bidPreparationRepository.AddAsync(bidPreparation);
                }
                else
                {
                    bidPreparation.DocumentCategoriesJson = request.DocumentCategoriesJson;
                    bidPreparation.ModifiedDate = now;
                    bidPreparation.UpdatedAt = now;
                    bidPreparation.UpdatedBy = request.UserId;
                    await _bidPreparationRepository.UpdateAsync(bidPreparation);
                }

                return true;
            }
            catch (Exception)
            {
                return false;
            }
        }
    }
}

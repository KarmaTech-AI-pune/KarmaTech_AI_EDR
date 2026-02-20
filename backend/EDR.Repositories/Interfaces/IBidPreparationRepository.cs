using EDR.Domain.Entities;

namespace EDR.Repositories.Interfaces
{
    public interface IBidPreparationRepository
    {
        Task<BidPreparation> GetByUserIdAsync(string userId);
        Task AddAsync(BidPreparation bidPreparation);
        Task UpdateAsync(BidPreparation bidPreparation);
    }
}

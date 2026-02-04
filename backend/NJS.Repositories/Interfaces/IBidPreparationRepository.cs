using NJS.Domain.Entities;

namespace NJS.Repositories.Interfaces
{
    public interface IBidPreparationRepository
    {
        Task<BidPreparation> GetByUserIdAsync(string userId);
        Task AddAsync(BidPreparation bidPreparation);
        Task UpdateAsync(BidPreparation bidPreparation);
    }
}
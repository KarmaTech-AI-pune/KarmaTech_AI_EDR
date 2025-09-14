using NJS.Domain.Entities;

namespace NJS.Repositories.Interfaces
{
    public interface ICheckReviewRepository
    {
        Task<IEnumerable<CheckReview>> GetAllAsync();
        Task<CheckReview> GetByIdAsync(int id);
        Task<IEnumerable<CheckReview>> GetByProjectIdAsync(int projectId);
        Task<int> AddAsync(CheckReview checkReview);
        Task UpdateAsync(CheckReview checkReview);
        Task DeleteAsync(int id);
        Task<bool> ExistsAsync(int id);
        Task<int> GetNextIdAsync();
        Task ResetIdentitySeedAsync();
    }
}
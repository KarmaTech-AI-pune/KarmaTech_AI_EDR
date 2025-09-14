using Microsoft.EntityFrameworkCore;
using NJS.Domain.Database;
using NJS.Domain.Entities;
using NJS.Repositories.Interfaces;

namespace NJS.Repositories.Repositories
{
    public class BidPreparationRepository : IBidPreparationRepository
    {
        private readonly ProjectManagementContext _context;

        public BidPreparationRepository(ProjectManagementContext context)
        {
            _context = context;
        }

        public async Task<BidPreparation> GetByUserIdAsync(string userId)
        {
            return await _context.BidPreparations
                .FirstOrDefaultAsync(b => b.UserId == userId);
        }

        public async Task AddAsync(BidPreparation bidPreparation)
        {
            await _context.BidPreparations.AddAsync(bidPreparation);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(BidPreparation bidPreparation)
        {
            _context.BidPreparations.Update(bidPreparation);
            await _context.SaveChangesAsync();
        }
    }
}
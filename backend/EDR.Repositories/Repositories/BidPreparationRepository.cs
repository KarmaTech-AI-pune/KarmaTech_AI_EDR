using Microsoft.EntityFrameworkCore;
using EDR.Domain.Database;
using EDR.Domain.Entities;
using EDR.Repositories.Interfaces;

namespace EDR.Repositories.Repositories
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

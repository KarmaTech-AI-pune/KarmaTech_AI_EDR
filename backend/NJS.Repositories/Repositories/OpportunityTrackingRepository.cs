using Microsoft.EntityFrameworkCore;
using NJS.Domain.Database;
using NJS.Domain.Entities;
using NJS.Repositories.Interfaces;

namespace NJS.Repositories.Repositories
{
    public class OpportunityTrackingRepository : IOpportunityTrackingRepository
    {
        private readonly ProjectManagementContext _context;

        public OpportunityTrackingRepository(ProjectManagementContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<OpportunityTracking>> GetAllAsync()
        {
            return await _context.OpportunityTrackings.Include(x=>x.OpportunityHistories).ThenInclude(x=>x.Status)
                .ToListAsync();
        }

        public async Task<OpportunityTracking?> GetByIdAsync(int id)
        {
            return await _context.OpportunityTrackings.Include(x=>x.OpportunityHistories)
                .FirstOrDefaultAsync(ot => ot.Id == id);
        }

        public async Task<OpportunityTracking> AddAsync(OpportunityTracking opportunityTracking)
        {

            var entityEntry = _context.OpportunityTrackings.Add(opportunityTracking);
            await _context.SaveChangesAsync();
            return opportunityTracking;
        }

        public async Task UpdateAsync(OpportunityTracking opportunityTracking)
        {
            _context.Entry(opportunityTracking).State = EntityState.Modified;
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var opportunityTracking = await _context.OpportunityTrackings.FindAsync(id);
            if (opportunityTracking != null)
            {
                _context.OpportunityTrackings.Remove(opportunityTracking);
                await _context.SaveChangesAsync();
            }
        }
    }
}

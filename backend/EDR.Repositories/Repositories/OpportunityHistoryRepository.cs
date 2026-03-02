using Microsoft.EntityFrameworkCore;
using EDR.Domain.Database;
using EDR.Domain.Entities;
using EDR.Repositories.Interfaces;

namespace EDR.Repositories.Repositories
{
    public class OpportunityHistoryRepository : IOpportunityHistoryRepository
    {
        private readonly ProjectManagementContext _context;

        public OpportunityHistoryRepository(ProjectManagementContext context)
        {
            _context = context;
        }

        public async Task<OpportunityHistory> GetByIdAsync(int id)
        {
            return await _context.OpportunityHistories
                .Include(oh => oh.Opportunity)
                .Include(oh => oh.Status)
                .Include(oh => oh.ActionUser)
                .FirstOrDefaultAsync(oh => oh.Id == id);
        }

        public async Task<List<OpportunityHistory>> GetAllAsync()
        {
            return await _context.OpportunityHistories
                .Include(oh => oh.Opportunity)
                .Include(oh => oh.Status)
                .Include(oh => oh.ActionUser)
                .ToListAsync();
        }

        public async Task AddAsync(OpportunityHistory opportunityHistory)
        {
            _context.OpportunityHistories.Add(opportunityHistory);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(OpportunityHistory opportunityHistory)
        {
            _context.OpportunityHistories.Update(opportunityHistory);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var opportunityHistory = await GetByIdAsync(id);
            if (opportunityHistory != null)
            {
                _context.OpportunityHistories.Remove(opportunityHistory);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<List<OpportunityHistory>> GetByOpportunityIdAsync(int opportunityId)
        {
            return await _context.OpportunityHistories
                .Where(oh => oh.OpportunityId == opportunityId)
                .Include(oh => oh.Opportunity)
                .Include(oh => oh.Status)
                .Include(oh => oh.ActionUser)
                .ToListAsync();
        }
    }
}

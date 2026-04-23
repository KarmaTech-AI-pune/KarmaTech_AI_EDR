using Microsoft.EntityFrameworkCore;
using EDR.Domain.Database;
using EDR.Domain.Entities;
using EDR.Repositories.Interfaces;

namespace EDR.Repositories.Repositories
{
    public class OpportunityTrackingRepository : IOpportunityTrackingRepository
    {
        private readonly ProjectManagementContext _context;

        public OpportunityTrackingRepository(ProjectManagementContext context)
        {
            _context = context;
        }

        public async Task<OpportunityTracking> AddAsync(OpportunityTracking opportunityTracking)
        {
            // Set audit fields
            opportunityTracking.CreatedAt = DateTime.UtcNow;
            opportunityTracking.UpdatedAt = DateTime.UtcNow;

            _context.OpportunityTrackings.Add(opportunityTracking);
            await _context.SaveChangesAsync();
            return opportunityTracking;
        }

        public async Task<OpportunityTracking> GetByIdAsync(int id)
        {
            var opportunity = await _context.OpportunityTrackings.Include(x => x.OpportunityHistories)
                .ThenInclude(x => x.Status)
                .FirstAsync(o => o.Id == id);

            if (opportunity == null)
            {
                throw new KeyNotFoundException($"Opportunity with ID {id} not found.");
            }

            return opportunity;
        }


        public async Task<IEnumerable<OpportunityTracking>> GetAllAsync()
        {
            return await _context.OpportunityTrackings.Include(x => x.OpportunityHistories).ThenInclude(x => x.Status)
                .ToListAsync();
        }

        public async Task<OpportunityTracking> UpdateAsync(OpportunityTracking opportunityTracking)
        {
            var existingOpportunity = await GetByIdAsync(opportunityTracking.Id);

            // Update audit fields
            opportunityTracking.UpdatedAt = DateTime.UtcNow;

            // Update all properties
            _context.Entry(existingOpportunity).CurrentValues.SetValues(opportunityTracking);
            await _context.SaveChangesAsync();

            return existingOpportunity;
        }

        public async Task DeleteAsync(int id)
        {
            var opportunity = await GetByIdAsync(id);

            _context.OpportunityTrackings.Remove(opportunity);
            await _context.SaveChangesAsync();
        }

        public async Task<IEnumerable<OpportunityTracking>> GetByBidManagerIdAsync(string bidManagerId)
        {
            return await _context.OpportunityTrackings.Include(x => x.OpportunityHistories).ThenInclude(x => x.Status)
                .Where(o => o.BidManagerId == bidManagerId)
                .ToListAsync();
        }

        public async Task<IEnumerable<OpportunityTracking>> GetByRegionalManagerIdAsync(string regionalManagerId)
        {
            return await _context.OpportunityTrackings.Include(x => x.OpportunityHistories).ThenInclude(x => x.Status)
                .Where(o => o.ReviewManagerId == regionalManagerId)
                .ToListAsync();
        }

        public async Task<IEnumerable<OpportunityTracking>> GetByRegionalDirectorIdAsync(string regionalDirectorId)
        {
            return await _context.OpportunityTrackings.Include(x => x.OpportunityHistories).ThenInclude(x => x.Status)
                .Where(o => o.ApprovalManagerId == regionalDirectorId)
                .ToListAsync();
        }

        public async Task<int?> GetStatusIdByNameAsync(string statusName)
        {
            var status = await _context.OpportunityStatuses
                .FirstOrDefaultAsync(s => s.Status.ToLower() == statusName.ToLower());
            return status?.Id;
        }

        public async Task<string?> GetValidUserIdAsync(string userIdOrEmail)
        {
            if (string.IsNullOrWhiteSpace(userIdOrEmail) || userIdOrEmail.ToLower() == "string")
            {
                return null;
            }

            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == userIdOrEmail || u.Email.ToLower() == userIdOrEmail.ToLower());

            return user?.Id;
        }
    }
}

using Microsoft.EntityFrameworkCore;
using NJS.Domain.Database;
using NJS.Domain.Entities;
using NJS.Repositories.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace NJS.Repositories.Repositories
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
            var opportunity = await _context.OpportunityTrackings
                .FirstOrDefaultAsync(o => o.Id == id);

            if (opportunity == null)
            {
                throw new KeyNotFoundException($"Opportunity with ID {id} not found.");
            }

            return opportunity;
        }

        public async Task<IEnumerable<OpportunityTracking>> GetByUserIdAsync(string userId)
        {
            return await _context.OpportunityTrackings
                .Where(o => o.BidManagerId == userId)
                .ToListAsync();
        }

        public async Task<IEnumerable<OpportunityTracking>> GetByReviewManagerIdAsync(string reviewManagerId)
        {
            return await _context.OpportunityTrackings
                .Where(o => o.ReviewManagerId == reviewManagerId)
                .ToListAsync();
        }

        public async Task<IEnumerable<OpportunityTracking>> GetByApprovalManagerIdAsync(string approvalManagerId)
        {
            return await _context.OpportunityTrackings
                .Where(o => o.ApprovalManagerId == approvalManagerId)
                .ToListAsync();
        }

        public async Task<IEnumerable<OpportunityTracking>> GetAllAsync()
        {
            return await _context.OpportunityTrackings.ToListAsync();
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
    }
}

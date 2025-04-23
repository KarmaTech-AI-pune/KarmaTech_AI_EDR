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
    public class CheckReviewRepository : ICheckReviewRepository
    {
        private readonly ProjectManagementContext _context;

        public CheckReviewRepository(ProjectManagementContext context)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }

        public async Task<IEnumerable<CheckReview>> GetAllAsync()
        {
            return await _context.CheckReviews
                .OrderBy(cr => cr.ProjectId)
                .ThenBy(cr => cr.ActivityNo)
                .ToListAsync();
        }

        public async Task<CheckReview> GetByIdAsync(int id)
        {
            return await _context.CheckReviews
                .FirstOrDefaultAsync(cr => cr.Id == id);
        }

        public async Task<IEnumerable<CheckReview>> GetByProjectIdAsync(int projectId)
        {
            return await _context.CheckReviews
                .Where(cr => cr.ProjectId == projectId)
                .OrderBy(cr => cr.ActivityNo)
                .ToListAsync();
        }

        public async Task<int> AddAsync(CheckReview checkReview)
        {
            if (checkReview == null) throw new ArgumentNullException(nameof(checkReview));

            // Check if we need to reset the identity seed before adding a new entry
            await ResetIdentitySeedAsync();

            checkReview.CreatedAt = DateTime.UtcNow;

            _context.CheckReviews.Add(checkReview);
            await _context.SaveChangesAsync();

            return checkReview.Id;
        }

        public async Task UpdateAsync(CheckReview checkReview)
        {
            if (checkReview == null) throw new ArgumentNullException(nameof(checkReview));

            var existingReview = await _context.CheckReviews.FindAsync(checkReview.Id);
            if (existingReview == null)
                throw new KeyNotFoundException($"CheckReview with ID {checkReview.Id} not found.");

            // Update the entity
            _context.Entry(existingReview).CurrentValues.SetValues(checkReview);
            existingReview.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var checkReview = await _context.CheckReviews.FindAsync(id);
            if (checkReview == null)
                throw new KeyNotFoundException($"CheckReview with ID {id} not found.");

            _context.CheckReviews.Remove(checkReview);
            await _context.SaveChangesAsync();
        }

        public async Task<bool> ExistsAsync(int id)
        {
            return await _context.CheckReviews.AnyAsync(cr => cr.Id == id);
        }

        public async Task<int> GetNextIdAsync()
        {
            // If there are no records, start with ID 1
            if (!await _context.CheckReviews.AnyAsync())
                return 1;

            // Otherwise, get the next available ID
            return await _context.CheckReviews.MaxAsync(cr => cr.Id) + 1;
        }

        public async Task ResetIdentitySeedAsync()
        {
            // Check if there are any records
            if (!await _context.CheckReviews.AnyAsync())
            {
                // Reset the identity seed to 1
                await _context.Database.ExecuteSqlRawAsync("DBCC CHECKIDENT('CheckReviews', RESEED, 0)");
            }
            else
            {
                // Find the lowest available ID
                var allIds = await _context.CheckReviews.Select(cr => cr.Id).ToListAsync();
                var lowestAvailableId = Enumerable.Range(1, allIds.Count + 1).Except(allIds).Min();

                if (lowestAvailableId <= allIds.Max())
                {
                    // There's a gap in the IDs, no need to reseed
                    return;
                }

                // Reset the identity seed to the max ID
                await _context.Database.ExecuteSqlRawAsync($"DBCC CHECKIDENT('CheckReviews', RESEED, {allIds.Max()})");
            }
        }
    }
}
